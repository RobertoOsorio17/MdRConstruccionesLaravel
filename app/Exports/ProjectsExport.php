<?php

namespace App\Exports;

use App\Models\Project;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Streams project portfolio data into spreadsheets for reporting, honoring filters like status and featured flags.
 * Supplies human-readable headings and formatted columns tailored to construction case studies.
 */
class ProjectsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query for projects with filters applied.
     */
    public function query()
    {
        $query = Project::query();

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
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
            'Ubicación',
            'Estado',
            'Destacado',
            'Fecha de Inicio',
            'Fecha de Fin',
            'Presupuesto Estimado',
            'Fecha de Creación',
        ];
    }

    /**
     * Map data for each row.
     */
    public function map($project): array
    {
        return [
            $project->id,
            $project->title,
            $project->location ?? 'N/A',
            ucfirst($project->status),
            $project->featured ? 'Sí' : 'No',
            $project->start_date ? $project->start_date->format('Y-m-d') : 'N/A',
            $project->end_date ? $project->end_date->format('Y-m-d') : 'N/A',
            $project->budget_estimate ? '€' . number_format($project->budget_estimate, 2) : 'N/A',
            $project->created_at->format('Y-m-d H:i:s'),
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

