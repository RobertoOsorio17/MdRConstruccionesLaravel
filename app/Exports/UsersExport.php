<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Facades\Request;

/**
 * Compiles user account data into a spreadsheet, respecting search, role, and status filters.
 * Helpful for compliance reviews, customer support, or off-platform analytics.
 */
class UsersExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Query for users with filters applied.
     */
    public function query()
    {
        $query = User::query();

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if (!empty($this->filters['role']) && $this->filters['role'] !== 'all') {
            $query->where('role', $this->filters['role']);
        }

        // Apply status filter
        if (isset($this->filters['status'])) {
            if ($this->filters['status'] === 'active') {
                $query->where('is_active', true);
            } elseif ($this->filters['status'] === 'inactive') {
                $query->where('is_active', false);
            } elseif ($this->filters['status'] === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($this->filters['status'] === 'unverified') {
                $query->whereNull('email_verified_at');
            }
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
            'Nombre',
            'Email',
            'Rol',
            'Estado',
            'Email Verificado',
            '2FA Habilitado',
            'Último Login',
            'Fecha de Registro',
        ];
    }

    /**
     * Map data for each row.
     */
    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            ucfirst($user->role),
            $user->is_active ? 'Activo' : 'Inactivo',
            $user->email_verified_at ? 'Sí' : 'No',
            $user->two_factor_secret ? 'Sí' : 'No',
            $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Nunca',
            $user->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Apply styles to the worksheet.
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold header
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

