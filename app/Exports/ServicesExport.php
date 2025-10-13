<?php

namespace App\Exports;

use App\Models\Service;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Builds an export of service offerings, including engagement counts and feature flags.
 * Designed for business stakeholders who need up-to-date catalog data in spreadsheet form.
 */
class ServicesExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query for services with filters applied.
     */
    public function query()
    {
        $query = Service::query();

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
        }

        // Apply featured filter
        if (isset($this->filters['featured'])) {
            $query->where('is_featured', $this->filters['featured']);
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
            'Descripción Corta',
            'Estado',
            'Destacado',
            'Vistas',
            'Favoritos',
            'Fecha de Creación',
            'Última Actualización',
        ];
    }

    /**
     * Map data for each row.
     */
    public function map($service): array
    {
        return [
            $service->id,
            $service->title,
            strip_tags(substr($service->description, 0, 100)) . '...',
            ucfirst($service->status),
            $service->is_featured ? 'Sí' : 'No',
            $service->views_count ?? 0,
            $service->favorites_count ?? 0,
            $service->created_at->format('Y-m-d H:i:s'),
            $service->updated_at->format('Y-m-d H:i:s'),
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

