<?php

namespace App\Exports;

use App\Models\Newsletter;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Exports newsletter subscriber records with optional status filters for marketing teams.
 * Provides structured headings, mappings, and styles compatible with common spreadsheet tooling.
 */
class NewsletterExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Get collection to export
     */
    public function collection()
    {
        $query = Newsletter::query();

        // Apply filters
        if (!empty($this->filters['status'])) {
            switch ($this->filters['status']) {
                case 'verified':
                    $query->verified()->active();
                    break;
                case 'unverified':
                    $query->unverified()->active();
                    break;
                case 'unsubscribed':
                    $query->whereNotNull('unsubscribed_at');
                    break;
            }
        }

        return $query->orderByDesc('created_at')->get();
    }

    /**
     * Define headings
     */
    public function headings(): array
    {
        return [
            'ID',
            'Email',
            'Name',
            'Status',
            'Verified',
            'Preferences',
            'Subscribed Date',
            'Verified Date',
            'Unsubscribed Date',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($newsletter): array
    {
        $status = 'Active';
        if ($newsletter->isUnsubscribed()) {
            $status = 'Unsubscribed';
        } elseif (!$newsletter->isVerified()) {
            $status = 'Pending Verification';
        }

        return [
            $newsletter->id,
            $newsletter->email,
            $newsletter->name ?? 'N/A',
            $status,
            $newsletter->isVerified() ? 'Yes' : 'No',
            $newsletter->preferences ? implode(', ', $newsletter->preferences) : 'All',
            $newsletter->created_at->format('Y-m-d H:i:s'),
            $newsletter->verified_at ? $newsletter->verified_at->format('Y-m-d H:i:s') : 'N/A',
            $newsletter->unsubscribed_at ? $newsletter->unsubscribed_at->format('Y-m-d H:i:s') : 'N/A',
        ];
    }

    /**
     * Apply styles
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD'],
                ],
            ],
        ];
    }
}

