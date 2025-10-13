<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles server-side image processing, including resizing, optimization, and derivative generation.
 * Wraps Intervention Image operations with storage helpers tailored to the application's media pipeline.
 */
class ImageOptimizationService
{
    protected ImageManager $manager;

    protected array $sizes = [
        'thumbnail' => ['width' => 150, 'height' => 150],
        'small' => ['width' => 300, 'height' => 300],
        'medium' => ['width' => 600, 'height' => 600],
        'large' => ['width' => 1200, 'height' => 1200],
    ];

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Optimize and resize an uploaded image.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory
     * @param array $sizes
     * @return array
     */
    public function optimizeAndResize($file, string $directory = 'images', array $sizes = []): array
    {
        $sizes = empty($sizes) ? $this->sizes : $sizes;
        $results = [];

        // Generate unique filename
        $filename = Str::random(40);
        $extension = $file->getClientOriginalExtension();

        // Read the image
        $image = $this->manager->read($file->getRealPath());

        // Save original (optimized)
        $originalPath = "{$directory}/original/{$filename}.{$extension}";
        $optimizedImage = $this->optimizeImage($image, 85);
        Storage::disk('public')->put($originalPath, $optimizedImage);
        
        $results['original'] = $originalPath;

        // Generate different sizes
        foreach ($sizes as $sizeName => $dimensions) {
            $resizedImage = clone $image;
            
            // Resize maintaining aspect ratio
            $resizedImage->scale(
                width: $dimensions['width'],
                height: $dimensions['height']
            );

            // Optimize and save
            $sizePath = "{$directory}/{$sizeName}/{$filename}.{$extension}";
            $optimizedResized = $this->optimizeImage($resizedImage, 80);
            Storage::disk('public')->put($sizePath, $optimizedResized);
            
            $results[$sizeName] = $sizePath;
        }

        return $results;
    }

    /**
     * Optimize a single image.
     *
     * @param mixed $image
     * @param int $quality
     * @return string
     */
    protected function optimizeImage($image, int $quality = 85): string
    {
        return $image->toJpeg($quality)->toString();
    }

    /**
     * Generate WebP versions of images.
     *
     * @param string $path
     * @return string|null
     */
    public function generateWebP(string $path): ?string
    {
        try {
            $fullPath = Storage::disk('public')->path($path);
            
            if (!file_exists($fullPath)) {
                return null;
            }

            $image = $this->manager->read($fullPath);
            $webpPath = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $path);
            
            $webpImage = $image->toWebp(85)->toString();
            Storage::disk('public')->put($webpPath, $webpImage);

            return $webpPath;
        } catch (\Exception $e) {
            \Log::error('WebP generation failed', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Delete all versions of an image.
     *
     * @param array $paths
     * @return void
     */
    public function deleteImageVersions(array $paths): void
    {
        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            // Also delete WebP version if exists
            $webpPath = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $path);
            if (Storage::disk('public')->exists($webpPath)) {
                Storage::disk('public')->delete($webpPath);
            }
        }
    }

    /**
     * Get image dimensions.
     *
     * @param string $path
     * @return array|null
     */
    public function getImageDimensions(string $path): ?array
    {
        try {
            $fullPath = Storage::disk('public')->path($path);
            
            if (!file_exists($fullPath)) {
                return null;
            }

            $image = $this->manager->read($fullPath);
            
            return [
                'width' => $image->width(),
                'height' => $image->height(),
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Create a thumbnail with exact dimensions (crop if needed).
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param int $width
     * @param int $height
     * @param string $directory
     * @return string
     */
    public function createThumbnail($file, int $width = 150, int $height = 150, string $directory = 'thumbnails'): string
    {
        $filename = Str::random(40) . '.jpg';
        $path = "{$directory}/{$filename}";

        $image = $this->manager->read($file->getRealPath());
        
        // Cover (crop to exact dimensions)
        $image->cover($width, $height);

        $optimized = $this->optimizeImage($image, 80);
        Storage::disk('public')->put($path, $optimized);

        return $path;
    }

    /**
     * Add watermark to an image.
     *
     * @param string $imagePath
     * @param string $watermarkPath
     * @param string $position
     * @return string
     */
    public function addWatermark(string $imagePath, string $watermarkPath, string $position = 'bottom-right'): string
    {
        $image = $this->manager->read(Storage::disk('public')->path($imagePath));
        $watermark = $this->manager->read(Storage::disk('public')->path($watermarkPath));

        // Resize watermark to 20% of image width
        $watermarkWidth = (int)($image->width() * 0.2);
        $watermark->scale(width: $watermarkWidth);

        // Calculate position
        $positions = [
            'top-left' => ['x' => 10, 'y' => 10],
            'top-right' => ['x' => $image->width() - $watermark->width() - 10, 'y' => 10],
            'bottom-left' => ['x' => 10, 'y' => $image->height() - $watermark->height() - 10],
            'bottom-right' => ['x' => $image->width() - $watermark->width() - 10, 'y' => $image->height() - $watermark->height() - 10],
            'center' => ['x' => ($image->width() - $watermark->width()) / 2, 'y' => ($image->height() - $watermark->height()) / 2],
        ];

        $pos = $positions[$position] ?? $positions['bottom-right'];

        // Place watermark
        $image->place($watermark, 'top-left', $pos['x'], $pos['y']);

        // Save
        $watermarkedPath = preg_replace('/(\.[^.]+)$/', '_watermarked$1', $imagePath);
        $optimized = $this->optimizeImage($image, 85);
        Storage::disk('public')->put($watermarkedPath, $optimized);

        return $watermarkedPath;
    }
}

