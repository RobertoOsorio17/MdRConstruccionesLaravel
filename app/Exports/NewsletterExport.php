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


    


    

    

    

    /**


    

    

    

     * Handle __construct.


    

    

    

     *


    

    

    

     * @param array $filters The filters.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    
    
    
    
    /**

    
    
    
     * Handle collection.

    
    
    
     *

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Handle headings.

    
    
    
     *

    
    
    
     * @return array

    
    
    
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

    
    
    
     * Handle map.

    
    
    
     *

    
    
    
     * @param mixed $newsletter The newsletter.

    
    
    
     * @return array

    
    
    
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

    
    
    
     * Handle styles.

    
    
    
     *

    
    
    
     * @param Worksheet $sheet The sheet.

    
    
    
     * @return void

    
    
    
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

