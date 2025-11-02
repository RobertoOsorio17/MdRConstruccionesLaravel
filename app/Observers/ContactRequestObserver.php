<?php

namespace App\Observers;

use App\Models\ContactRequest;
use App\Models\AdminAuditLog;
use Illuminate\Support\Facades\Log;

/**
 * Observes contact request events to generate audit logs and administrative notifications.
 * Keeps staff informed about new inquiries, status transitions, and deletions.
 */
class ContactRequestObserver
{
    
    
    
    
    /**

    
    
    
     * Handle created.

    
    
    
     *

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function created(ContactRequest $contactRequest): void
    {
        // Log new contact request creation for admin notification
        try {
            Log::info('New contact request created', [
                'id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'service' => $contactRequest->service,
                'status' => $contactRequest->status,
            ]);

            // Create admin notification for new contact request
            \App\Models\AdminNotification::createSystem([
                'type' => 'success',
                'title' => 'Nueva Solicitud de Contacto',
                'message' => 'Nueva solicitud de ' . $contactRequest->name . ' (' . $contactRequest->email . ')' . ($contactRequest->service ? ' - Servicio: ' . $contactRequest->service : ''),
                'data' => [
                    'contact_request_id' => $contactRequest->id,
                    'name' => $contactRequest->name,
                    'email' => $contactRequest->email,
                    'service' => $contactRequest->service,
                    'phone' => $contactRequest->phone,
                ],
                'action_url' => route('admin.contact-requests.index'),
                'action_text' => 'Ver Solicitudes',
                'priority' => 'high',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log contact request creation', ['error' => $e->getMessage()]);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle updated.

    
    
    
     *

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updated(ContactRequest $contactRequest): void
    {
        // Log status changes by admin
        if (auth()->check() && auth()->user()->role === 'admin') {
            try {
                $changes = $contactRequest->getChanges();
                
                if (isset($changes['status'])) {
                    AdminAuditLog::logAction([
                        'action' => 'update',
                        'model_type' => ContactRequest::class,
                        'model_id' => $contactRequest->id,
                        'severity' => 'low',
                        'description' => 'Updated contact request status to: ' . $changes['status'],
                        'old_values' => ['status' => $contactRequest->getOriginal('status')],
                        'new_values' => ['status' => $changes['status']],
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to log contact request update', ['error' => $e->getMessage()]);
            }
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle deleted.

    
    
    
     *

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function deleted(ContactRequest $contactRequest): void
    {
        // Log deletion by admin
        if (auth()->check() && auth()->user()->role === 'admin') {
            try {
                AdminAuditLog::logAction([
                    'action' => 'delete',
                    'model_type' => ContactRequest::class,
                    'model_id' => $contactRequest->id,
                    'severity' => 'medium',
                    'description' => 'Deleted contact request from: ' . $contactRequest->name,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to log contact request deletion', ['error' => $e->getMessage()]);
            }
        }
    }
}

