<?php

namespace App\Exports;

use App\Models\Comment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Prepares comment records for export, honoring search and status filters supplied by the UI.
 * Uses Laravel Excel interfaces to produce structured spreadsheets ready for moderation reviews.
 */
class CommentsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query for comments with filters applied.
     */
    public function query()
    {
        $query = Comment::with(['user', 'post']);

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply status filter
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
        }

        // Apply post filter
        if (!empty($this->filters['post_id'])) {
            $query->where('post_id', $this->filters['post_id']);
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
            'Usuario',
            'Post',
            'Contenido',
            'Estado',
            'Fecha de Creación',
        ];
    }

    /**
     * Map data for each row.
     */
    public function map($comment): array
    {
        return [
            $comment->id,
            $comment->user ? $comment->user->name : 'Anónimo',
            $comment->post ? $comment->post->title : 'N/A',
            strip_tags(substr($comment->content, 0, 200)) . '...',
            ucfirst($comment->status),
            $comment->created_at->format('Y-m-d H:i:s'),
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

