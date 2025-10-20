<?php

namespace App\Exports;

use App\Models\Post;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Produces an exportable dataset of blog posts with optional search, category, and feature filters.
 * Formats columns for downstream analytics while retaining key editorial metadata.
 */
class PostsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query for posts with filters applied.
     */
    public function query()
    {
        $query = Post::with(['user', 'categories'])->withCount('comments');

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
        }

        // Apply category filter
        if (!empty($this->filters['category_id'])) {
            $query->whereHas('categories', function ($q) {
                $q->where('categories.id', $this->filters['category_id']);
            });
        }

        // Apply featured filter
        if (isset($this->filters['featured'])) {
            $query->where('featured', $this->filters['featured']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Define column headings.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Título',
            'Autor',
            'Categoría',
            'Estado',
            'Destacado',
            'Vistas',
            'Comentarios',
            'Fecha de Publicación',
            'Fecha de Creación',
        ];
    }

    /**
     * Map data for each row.
     */
    public function map($post): array
    {
        $categories = $post->categories->pluck('name')->join(', ') ?: 'Sin categoría';

        return [
            $post->id,
            $post->title,
            $post->user ? $post->user->name : 'N/A',
            $categories,
            ucfirst($post->status),
            $post->featured ? 'Sí' : 'No',
            $post->views_count ?? 0,
            $post->comments_count ?? 0,
            $post->published_at ? $post->published_at->format('Y-m-d H:i:s') : 'No publicado',
            $post->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Apply styles to the worksheet.
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1976D2']
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
        ];
    }
}

