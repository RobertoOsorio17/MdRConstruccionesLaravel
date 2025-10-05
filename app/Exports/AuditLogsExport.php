<?php

namespace App\Exports;

use App\Models\AdminAuditLog;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;

class AuditLogsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Build the query for export with filters applied.
     */
    public function query()
    {
        $query = AdminAuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by user
        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        // Filter by action
        if (!empty($this->filters['action'])) {
            $query->where('action', $this->filters['action']);
        }

        // Filter by date range
        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        // Filter by severity
        if (!empty($this->filters['severity'])) {
            $query->where('severity', $this->filters['severity']);
        }

        return $query;
    }

    /**
     * Define the column headings for the export.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Usuario',
            'Email',
            'Acción',
            'Descripción',
            'Modelo',
            'ID Modelo',
            'Severidad',
            'Dirección IP',
            'User Agent',
            'Ruta',
            'URL',
            'Fecha y Hora',
        ];
    }

    /**
     * Map each audit log to an array for export.
     */
    public function map($log): array
    {
        return [
            $log->id,
            $log->user ? $log->user->name : 'Sistema',
            $log->user ? $log->user->email : 'N/A',
            $log->action,
            $log->description ?: $log->formatted_description,
            $log->model_type ? class_basename($log->model_type) : 'N/A',
            $log->model_id ?: 'N/A',
            $this->getSeverityLabel($log->severity),
            $log->ip_address,
            $log->user_agent,
            $log->route_name ?: 'N/A',
            $log->url,
            $log->created_at->format('d/m/Y H:i:s'),
        ];
    }

    /**
     * Apply styles to the spreadsheet.
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1976D2'],
                ],
            ],
        ];
    }

    /**
     * Get human-readable severity label.
     */
    private function getSeverityLabel(?string $severity): string
    {
        return match($severity) {
            'low' => 'Baja',
            'medium' => 'Media',
            'high' => 'Alta',
            'critical' => 'Crítica',
            default => 'N/A',
        };
    }
}

