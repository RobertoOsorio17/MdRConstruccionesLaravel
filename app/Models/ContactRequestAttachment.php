<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        // Generate encryption key
        $encryptionKey = Str::random(32);

        // Encrypt file contents using AES-256
        $encryptedContents = openssl_encrypt(
            $fileContents,
            'AES-256-CBC',
            $encryptionKey,
            0,
            substr(hash('sha256', $encryptionKey), 0, 16)
        );

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
            $encryptedContents
        );

        // Create database record
        return self::create([
            'contact_request_id' => $contactRequestId,
            'original_filename' => $file->getClientOriginalName(),
            'encrypted_filename' => $encryptedFilename,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'encryption_key' => Crypt::encryptString($encryptionKey), // Encrypt the key with app key
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

            $encryptedContents = file_get_contents($filePath);

            if (!$encryptedContents) {
                return false;
            }

            // Decrypt the encryption key
            $encryptionKey = Crypt::decryptString($this->encryption_key);

            // Decrypt file contents
            $decryptedContents = openssl_decrypt(
                $encryptedContents,
                'AES-256-CBC',
                $encryptionKey,
                0,
                substr(hash('sha256', $encryptionKey), 0, 16)
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
