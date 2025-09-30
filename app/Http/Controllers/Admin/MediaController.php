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
     * Upload a new media file.
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

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'];
            if (!in_array($file->getMimeType(), $allowedTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File type is not allowed.'
                ], 422);
            }

            // Generate unique filename
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

            // Store file
            $path = $file->storeAs($folder, $filename, 'public');
            $url = Storage::disk('public')->url($path);

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
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
     * Bulk delete media files.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'A list of files is required.'
            ], 422);
        }

        try {
            $files = $request->get('files');
            $deletedCount = 0;

            foreach ($files as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                    $deletedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} file(s) deleted successfully."
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete files: ' . $e->getMessage()
            ], 500);
        }
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
