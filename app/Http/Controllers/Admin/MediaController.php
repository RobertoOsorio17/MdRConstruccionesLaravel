<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    /**
     * Display a listing of media files.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $search = $request->get('search');
        $type = $request->get('type'); // image, video, document, etc.

        // Get files from storage
        $files = collect(Storage::disk('public')->allFiles('uploads'))
            ->map(function ($file) {
                $fullPath = Storage::disk('public')->path($file);
                $url = Storage::disk('public')->url($file);
                
                return [
                    'name' => basename($file),
                    'path' => $file,
                    'url' => $url,
                    'size' => Storage::disk('public')->size($file),
                    'type' => $this->getFileType($file),
                    'mime_type' => Storage::disk('public')->mimeType($file),
                    'last_modified' => Storage::disk('public')->lastModified($file),
                    'formatted_size' => $this->formatBytes(Storage::disk('public')->size($file)),
                    'formatted_date' => date('d/m/Y H:i', Storage::disk('public')->lastModified($file)),
                ];
            })
            ->filter(function ($file) use ($search, $type) {
                $matchesSearch = !$search || str_contains(strtolower($file['name']), strtolower($search));
                $matchesType = !$type || $file['type'] === $type;
                
                return $matchesSearch && $matchesType;
            })
            ->sortByDesc('last_modified')
            ->values();

        // Manual pagination
        $total = $files->count();
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedFiles = $files->slice($offset, $perPage)->values();

        $pagination = [
            'current_page' => $currentPage,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage),
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ];

        return Inertia::render('Admin/Media/Index', [
            'files' => $paginatedFiles,
            'pagination' => $pagination,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total_files' => $total,
                'total_size' => $this->formatBytes($files->sum('size')),
                'images' => $files->where('type', 'image')->count(),
                'documents' => $files->where('type', 'document')->count(),
                'videos' => $files->where('type', 'video')->count(),
                'others' => $files->whereNotIn('type', ['image', 'document', 'video'])->count(),
            ]
        ]);
    }

    /**
     * Upload a new media file with enhanced security validation.
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'folder' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $folder = $request->get('folder', 'uploads');

            // Enhanced security: Validate file content by magic bytes
            if (!$this->validateFileContent($file)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File validation failed: Invalid file content detected.'
                ], 422);
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'];
            if (!in_array($file->getMimeType(), $allowedTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File type is not allowed.'
                ], 422);
            }

            // Robust filename sanitization
            $sanitizedName = $this->sanitizeFilename(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = time() . '_' . $sanitizedName . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();

            // Store file
            $path = $file->storeAs($folder, $filename, 'public');
            $url = Storage::disk('public')->url($path);

            // Log upload for audit
            \Log::info('Media uploaded', [
                'user_id' => auth()->id(),
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully.',
                'file' => [
                    'name' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => $url,
                    'size' => $file->getSize(),
                    'type' => $this->getFileType($path),
                    'mime_type' => $file->getMimeType(),
                    'formatted_size' => $this->formatBytes($file->getSize()),
                    'alt_text' => $request->get('alt_text', ''),
                    'caption' => $request->get('caption', ''),
                    'uploaded_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Media upload failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate file content by checking magic bytes.
     */
    private function validateFileContent($file): bool
    {
        $allowedMagicBytes = [
            // JPEG
            'ffd8ff',
            // PNG
            '89504e47',
            // GIF
            '474946',
            // PDF
            '25504446',
            // WebP
            '52494646',
            // MP4
            '66747970',
            // WebM
            '1a45dfa3',
        ];

        try {
            $handle = fopen($file->getRealPath(), 'rb');
            if (!$handle) {
                return false;
            }

            $bytes = bin2hex(fread($handle, 8));
            fclose($handle);

            foreach ($allowedMagicBytes as $magic) {
                if (strpos($bytes, $magic) !== false) {
                    return true;
                }
            }
        } catch (\Exception $e) {
            \Log::warning('File content validation failed', ['error' => $e->getMessage()]);
            return false;
        }

        return false;
    }

    /**
     * Sanitize filename to prevent security issues.
     */
    private function sanitizeFilename(string $filename): string
    {
        // Remove any path traversal attempts
        $filename = basename($filename);

        // Remove special characters except alphanumeric, dash, and underscore
        $filename = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $filename);

        // Remove multiple consecutive underscores
        $filename = preg_replace('/_+/', '_', $filename);

        // Trim underscores from start and end
        $filename = trim($filename, '_');

        // Ensure filename is not empty
        if (empty($filename)) {
            $filename = 'file';
        }

        // Limit length
        return Str::limit($filename, 100, '');
    }

    /**
     * Get media list for TinyMCE
     */
    public function list(Request $request)
    {
        try {
            // Get only image files
            $files = collect(Storage::disk('public')->allFiles('uploads'))
                ->map(function ($file) {
                    $fullPath = Storage::disk('public')->path($file);
                    $url = Storage::disk('public')->url($file);
                    $type = $this->getFileType($file);

                    return [
                        'title' => basename($file),
                        'value' => $url,
                        'type' => $type,
                    ];
                })
                ->filter(function ($file) {
                    return $file['type'] === 'image';
                })
                ->values()
                ->toArray();

            return response()->json($files);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    /**
     * Delete a media file.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'File path is required.'
            ], 422);
        }

        try {
            $path = $request->get('path');
            
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The file does not exist.'
                ], 404);
            }

            Storage::disk('public')->delete($path);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete media files with enhanced security.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:100', // Limit to 100 files per operation
            'files.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $files = $request->get('files');
            $deletedCount = 0;
            $failedFiles = [];

            foreach ($files as $path) {
                // Validate path to prevent path traversal
                if (!$this->isValidPath($path)) {
                    $failedFiles[] = $path;
                    continue;
                }

                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                    $deletedCount++;
                } else {
                    $failedFiles[] = $path;
                }
            }

            // Log bulk delete operation
            \Log::info('Bulk media delete', [
                'user_id' => auth()->id(),
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedFiles),
            ]);

            $message = "{$deletedCount} file(s) deleted successfully.";
            if (count($failedFiles) > 0) {
                $message .= " " . count($failedFiles) . " file(s) failed.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedFiles),
            ]);
        } catch (\Exception $e) {
            \Log::error('Bulk media delete failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete files: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate path to prevent path traversal attacks.
     */
    private function isValidPath(string $path): bool
    {
        // Normalize path
        $normalizedPath = str_replace('\\', '/', $path);

        // Check for path traversal attempts
        if (strpos($normalizedPath, '..') !== false) {
            return false;
        }

        // Check for absolute paths
        if (strpos($normalizedPath, '/') === 0 || preg_match('/^[a-zA-Z]:/', $normalizedPath)) {
            return false;
        }

        // Ensure path starts with allowed directories
        $allowedPrefixes = ['uploads/', 'media/', 'images/'];
        $isAllowed = false;
        foreach ($allowedPrefixes as $prefix) {
            if (strpos($normalizedPath, $prefix) === 0) {
                $isAllowed = true;
                break;
            }
        }

        return $isAllowed;
    }

    /**
     * Get file type based on extension.
     */
    private function getFileType($filename)
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        $documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        } elseif (in_array($extension, $documentExtensions)) {
            return 'document';
        }
        
        return 'other';
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
