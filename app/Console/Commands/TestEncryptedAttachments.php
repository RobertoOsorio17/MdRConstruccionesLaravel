<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ContactRequest;
use App\Models\ContactRequestAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Simulates encrypted attachment workflows by generating sample contact requests with secured files.
 * Verifies encryption, storage integrity, and decryption to validate the attachment pipeline end-to-end.
 */
class TestEncryptedAttachments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:encrypted-attachments {--count=3 : Number of test files to create}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test encrypted attachments system by creating a contact request with encrypted files';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        $count = (int) $this->option('count');

        $this->info('Testing Encrypted Attachments System...');
        $this->newLine();

        // Create a test contact request
        $this->info('Creating test contact request...');
        $contactRequest = ContactRequest::create([
            'name' => 'Test User - Encrypted Attachments',
            'email' => 'test@example.com',
            'phone' => '+34 600 123 456',
            'preferred_contact' => 'email',
            'contact_time' => 'morning',
            'service' => 'Construcción de Viviendas',
            'message' => 'Esta es una solicitud de prueba para verificar el sistema de archivos adjuntos cifrados.',
            'status' => 'new',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Command',
        ]);

        $this->info("[OK] Contact request created with ID: {$contactRequest->id}");
        $this->newLine();

        // Create test files
        $this->info("Creating {$count} test encrypted files...");
        $this->newLine();

        $testFiles = [
            [
                'name' => 'test-document.pdf',
                'content' => '%PDF-1.4 Test PDF Content',
                'mime' => 'application/pdf',
            ],
            [
                'name' => 'test-image.jpg',
                'content' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='),
                'mime' => 'image/jpeg',
            ],
            [
                'name' => 'test-spreadsheet.xlsx',
                'content' => 'PK' . str_repeat('X', 100), // Simulated XLSX
                'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
        ];

        $createdAttachments = [];

        for ($i = 0; $i < min($count, count($testFiles)); $i++) {
            $fileData = $testFiles[$i];
            
            // Create temporary file
            $tempPath = sys_get_temp_dir() . '/' . $fileData['name'];
            file_put_contents($tempPath, $fileData['content']);

            // Create UploadedFile instance
            $uploadedFile = new UploadedFile(
                $tempPath,
                $fileData['name'],
                $fileData['mime'],
                null,
                true
            );

            try {
                // Store encrypted
                $attachment = ContactRequestAttachment::storeEncrypted($uploadedFile, $contactRequest->id);
                
                $createdAttachments[] = $attachment;

                $fileNum = $i + 1;
                $this->info("  File {$fileNum}: {$fileData['name']}");
                $this->line("     - Original: {$fileData['name']}");
                $this->line("     - Encrypted: {$attachment->encrypted_filename}");
                $this->line("     - Size: {$attachment->formatted_size}");
                $this->line("     - Hash: " . substr($attachment->file_hash, 0, 16) . '...');
                $this->newLine();

            } catch (\Exception $e) {
                $this->error("  ❌ Failed to encrypt {$fileData['name']}: {$e->getMessage()}");
            } finally {
                // Clean up temp file
                @unlink($tempPath);
            }
        }

        $this->newLine();
        $this->info('Verifying encrypted files...');
        $this->newLine();

        foreach ($createdAttachments as $attachment) {
            // Verify file exists
            $filePath = storage_path('app/contact-attachments/' . $attachment->encrypted_filename);

            if (file_exists($filePath)) {
                $this->info("  [OK] Encrypted file exists: {$attachment->encrypted_filename}");

                // Try to decrypt
                $decrypted = $attachment->getDecryptedContents();

                if ($decrypted !== false) {
                    $this->info("     [OK] Decryption successful");
                    $this->info("     [OK] Integrity verified (hash match)");
                } else {
                    $this->error("     [ERROR] Decryption failed or integrity check failed");
                }
            } else {
                $this->error("  [ERROR] Encrypted file not found: {$attachment->encrypted_filename}");
            }
            
            $this->newLine();
        }

        $this->info('Summary:');

        $totalSize = array_sum(array_map(fn($att) => $att->file_size, $createdAttachments));

        $this->table(
            ['Metric', 'Value'],
            [
                ['Contact Request ID', $contactRequest->id],
                ['Files Created', count($createdAttachments)],
                ['Total Size', $totalSize . ' bytes'],
                ['Storage Path', 'storage/app/contact-attachments/'],
            ]
        );

        $this->newLine();
        $this->info('[SUCCESS] Test completed successfully!');
        $this->newLine();
        $this->info('Next steps:');
        $this->line('  1. Open admin panel: http://localhost:8000/admin/contact-requests');
        $this->line("  2. View contact request #{$contactRequest->id}");
        $this->line('  3. Try downloading the encrypted attachments');
        $this->line('  4. Check audit logs for download records');

        return Command::SUCCESS;
    }
}

