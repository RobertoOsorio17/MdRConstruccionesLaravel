<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles encrypted file attachments associated with contact requests, including storage and integrity checks.
 * Encapsulates encryption key management, size formatting, and download tracking for sensitive uploads.
 */
class ContactRequestAttachment extends Model
{
    protected $fillable = [
        'contact_request_id',
        'original_filename',
        'encrypted_filename',
        'mime_type',
        'file_size',
        'encryption_key',
        'file_hash',
        'downloaded_count',
        'last_downloaded_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'downloaded_count' => 'integer',
        'last_downloaded_at' => 'datetime',
    ];

    /**
     * Get the contact request that owns the attachment.
     */
    public function contactRequest(): BelongsTo
    {
        return $this->belongsTo(ContactRequest::class);
    }

    /**
     * Store an uploaded file with encryption.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param int $contactRequestId
     * @return self
     */
    public static function storeEncrypted($file, int $contactRequestId): self
    {
        // Generate unique encrypted filename
        $encryptedFilename = Str::uuid() . '.enc';

        // Read file contents
        $fileContents = file_get_contents($file->getRealPath());

        // Generate encryption key (32 bytes for AES-256)
        $encryptionKey = random_bytes(32);

        // ✅ SECURITY: Generate random IV for AES-256-CBC (16 bytes)
        // CRITICAL: Never use deterministic IV - it breaks semantic security
        $iv = random_bytes(16);

        // Encrypt file contents using AES-256-CBC with random IV
        $encryptedContents = openssl_encrypt(
            $fileContents,
            'AES-256-CBC',
            $encryptionKey,
            OPENSSL_RAW_DATA,
            $iv
        );

        // Prepend IV to encrypted data (standard practice for CBC mode)
        // Format: [IV (16 bytes)][Encrypted Data]
        $encryptedDataWithIV = $iv . $encryptedContents;

        // Calculate file hash for integrity
        $fileHash = hash('sha256', $fileContents);

        // Store encrypted file in storage/app/contact-attachments/
        // Using absolute path to ensure correct location
        $storagePath = storage_path('app/contact-attachments');

        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }

        file_put_contents(
            $storagePath . '/' . $encryptedFilename,
            $encryptedDataWithIV
        );

        // Create database record
        return self::create([
            'contact_request_id' => $contactRequestId,
            'original_filename' => $file->getClientOriginalName(),
            'encrypted_filename' => $encryptedFilename,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            // Encrypt the binary key with app key (base64 encode first for safe storage)
            'encryption_key' => Crypt::encryptString(base64_encode($encryptionKey)),
            'file_hash' => $fileHash,
        ]);
    }

    /**
     * Decrypt and retrieve file contents.
     *
     * @return string|false
     */
    public function getDecryptedContents()
    {
        try {
            // Get encrypted file contents from storage/app/contact-attachments/
            $filePath = storage_path('app/contact-attachments/' . $this->encrypted_filename);

            if (!file_exists($filePath)) {
                \Log::error('Encrypted file not found', [
                    'attachment_id' => $this->id,
                    'path' => $filePath,
                ]);
                return false;
            }

            $encryptedDataWithIV = file_get_contents($filePath);

            if (!$encryptedDataWithIV) {
                return false;
            }

            // Decrypt the encryption key and decode from base64
            $encryptionKey = base64_decode(Crypt::decryptString($this->encryption_key));

            // ✅ SECURITY: Extract IV from the beginning of encrypted data
            // Format: [IV (16 bytes)][Encrypted Data]
            $iv = substr($encryptedDataWithIV, 0, 16);
            $encryptedContents = substr($encryptedDataWithIV, 16);

            // Decrypt file contents using extracted IV
            $decryptedContents = openssl_decrypt(
                $encryptedContents,
                'AES-256-CBC',
                $encryptionKey,
                OPENSSL_RAW_DATA,
                $iv
            );

            // Verify integrity
            $currentHash = hash('sha256', $decryptedContents);
            if ($currentHash !== $this->file_hash) {
                \Log::error('File integrity check failed', [
                    'attachment_id' => $this->id,
                    'expected_hash' => $this->file_hash,
                    'actual_hash' => $currentHash,
                ]);
                return false;
            }

            return $decryptedContents;
        } catch (\Exception $e) {
            \Log::error('Failed to decrypt attachment', [
                'attachment_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Increment download counter.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('downloaded_count');
        $this->update(['last_downloaded_at' => now()]);
    }

    /**
     * Get formatted file size.
     *
     * @return string
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Get file extension from original filename.
     *
     * @return string
     */
    public function getExtensionAttribute(): string
    {
        return pathinfo($this->original_filename, PATHINFO_EXTENSION);
    }

    /**
     * Delete the attachment and its encrypted file.
     *
     * @return bool|null
     */
    public function delete()
    {
        // Delete encrypted file from storage/app/contact-attachments/
        $filePath = storage_path('app/contact-attachments/' . $this->encrypted_filename);

        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        // Delete database record
        return parent::delete();
    }
}
