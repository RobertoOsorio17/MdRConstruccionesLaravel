<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use App\Models\ContactRequestAttachment;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

/**
 * Supervises the intake and triage of contact requests submitted through public channels.
 * Delivers administrative tooling to review submissions, respond, track attachments, and log follow-up actions.
 */
class ContactRequestController extends Controller
{
    /**
     * Display a listing of contact requests
     */
    public function index(Request $request)
    {
        // ✅ Authorize using Policy
        Gate::authorize('viewAny', ContactRequest::class);

        $query = ContactRequest::with('respondedBy:id,name')
            ->withCount('attachments');

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by service
        if ($request->filled('service')) {
            $query->where('service', $request->service);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort with whitelist validation
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // ✅ SECURITY: Whitelist allowed sort fields and directions
        $allowedSorts = ['name', 'email', 'subject', 'status', 'created_at', 'updated_at'];
        $allowedDirections = ['asc', 'desc'];

        if (in_array($sortField, $allowedSorts) && in_array(strtolower($sortDirection), $allowedDirections)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $requests = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total' => ContactRequest::count(),
            'new' => ContactRequest::new()->count(),
            'read' => ContactRequest::read()->count(),
            'responded' => ContactRequest::responded()->count(),
            'archived' => ContactRequest::archived()->count(),
        ];

        return Inertia::render('Admin/ContactRequests/Index', [
            'requests' => $requests,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'service', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    /**
     * Display the specified contact request
     */
    public function show(ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('view', $contactRequest);

        $contactRequest->load([
            'respondedBy:id,name',
            'attachments' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }
        ]);

        // Auto-mark as read if it's new
        if ($contactRequest->status === 'new') {
            $contactRequest->markAsRead();
        }

        // Format attachments for frontend (handle null case)
        $formattedAttachments = $contactRequest->attachments
            ? $contactRequest->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'original_filename' => $attachment->original_filename,
                    'mime_type' => $attachment->mime_type,
                    'file_size' => $attachment->file_size,
                    'formatted_size' => $attachment->formatted_size,
                    'extension' => $attachment->extension,
                    'downloaded_count' => $attachment->downloaded_count,
                    'last_downloaded_at' => $attachment->last_downloaded_at,
                    'created_at' => $attachment->created_at,
                ];
            })
            : collect([]);

        return Inertia::render('Admin/ContactRequests/Show', [
            'request' => $contactRequest,
            'attachments' => $formattedAttachments,
        ]);
    }

    /**
     * Mark as read
     */
    public function markAsRead(ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('markAsRead', $contactRequest);

        $contactRequest->markAsRead();

        return back()->with('success', 'Solicitud marcada como leída.');
    }

    /**
     * Mark as responded
     */
    public function markAsResponded(ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('markAsResponded', $contactRequest);

        $contactRequest->markAsResponded(auth()->id());

        return back()->with('success', 'Solicitud marcada como respondida.');
    }

    /**
     * Archive request
     */
    public function archive(ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('archive', $contactRequest);

        $contactRequest->archive();

        return back()->with('success', 'Solicitud archivada.');
    }

    /**
     * Add admin notes
     */
    public function addNotes(Request $request, ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('addNotes', $contactRequest);

        // ✅ Validate
        $validated = $request->validate([
            'notes' => 'required|string|max:5000',
        ]);

        $contactRequest->update([
            'admin_notes' => $validated['notes'],
        ]);

        return back()->with('success', 'Notas guardadas exitosamente.');
    }


    /**
     * Remove the specified contact request
     */
    public function destroy(ContactRequest $contactRequest)
    {
        // ✅ Authorize using Policy
        Gate::authorize('delete', $contactRequest);

        // Count attachments before deletion
        $attachmentCount = $contactRequest->attachments()->count();

        // ✅ Delete encrypted attachments (uses delete() method in ContactRequestAttachment model)
        foreach ($contactRequest->attachments as $attachment) {
            $attachment->delete(); // This deletes both DB record and encrypted file
        }

        // ✅ Log deletion in audit logs
        AdminAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'delete',
            'model_type' => ContactRequest::class,
            'model_id' => $contactRequest->id,
            'description' => "Eliminó solicitud de contacto #{$contactRequest->id} de {$contactRequest->name} ({$contactRequest->email})" .
                            ($attachmentCount > 0 ? " con {$attachmentCount} archivo(s) adjunto(s)" : ""),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'high',
            'changes' => [
                'contact_request_id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'attachments_deleted' => $attachmentCount,
            ],
        ]);

        // ✅ Delete contact request
        $contactRequest->delete();

        return redirect()->route('admin.contact-requests.index')
            ->with('success', 'Solicitud eliminada correctamente.');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        // ✅ Authorize using Policy
        Gate::authorize('bulkAction', ContactRequest::class);

        // ✅ Validate
        $validated = $request->validate([
            'action' => 'required|in:mark_read,mark_responded,archive,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:contact_requests,id',
        ]);

        $count = 0;

        switch ($validated['action']) {
            case 'mark_read':
                ContactRequest::whereIn('id', $validated['ids'])->update([
                    'status' => 'read',
                    'read_at' => now(),
                ]);
                $message = "Se marcaron como leídas.";
                break;

            case 'mark_responded':
                ContactRequest::whereIn('id', $validated['ids'])->update([
                    'status' => 'responded',
                    'responded_at' => now(),
                    'responded_by' => auth()->id(),
                ]);
                $message = "Se marcaron como respondidas.";
                break;

            case 'archive':
                ContactRequest::whereIn('id', $validated['ids'])->update([
                    'status' => 'archived',
                ]);
                $message = "Se archivaron.";
                break;

            case 'delete':
                if (!auth()->user()->hasPermission('contact.delete')) {
                    abort(403, 'Unauthorized action.');
                }
                $count = ContactRequest::whereIn('id', $validated['ids'])->delete();
                $message = "Se eliminaron {$count} solicitudes.";
                break;
        }

        return back()->with('success', $message);
    }

    /**
     * Download an encrypted attachment securely.
     *
     * @param ContactRequest $contactRequest
     * @param ContactRequestAttachment $attachment
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadAttachment(ContactRequest $contactRequest, ContactRequestAttachment $attachment)
    {
        // ✅ Authorize using Policy
        Gate::authorize('view', $contactRequest);

        // ✅ Verify attachment belongs to this contact request
        if ($attachment->contact_request_id !== $contactRequest->id) {
            abort(403, 'Este archivo no pertenece a esta solicitud.');
        }

        // ✅ Rate limiting: 20 downloads per minute per user
        $key = 'attachment-download:' . auth()->id();

        if (RateLimiter::tooManyAttempts($key, 20)) {
            $seconds = RateLimiter::availableIn($key);
            abort(429, "Demasiadas descargas. Por favor espera {$seconds} segundos.");
        }

        RateLimiter::hit($key, 60);

        // ✅ Decrypt file contents
        $decryptedContents = $attachment->getDecryptedContents();

        if ($decryptedContents === false) {
            \Log::error('Failed to decrypt attachment for download', [
                'attachment_id' => $attachment->id,
                'contact_request_id' => $contactRequest->id,
                'user_id' => auth()->id(),
            ]);
            abort(500, 'Error al descargar el archivo. Por favor contacta al administrador.');
        }

        // ✅ Increment download counter
        $attachment->incrementDownloadCount();

        // ✅ Log download in audit logs
        AdminAuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'download',
            'model_type' => ContactRequestAttachment::class,
            'model_id' => $attachment->id,
            'description' => "Descargó archivo adjunto: {$attachment->original_filename} de solicitud #{$contactRequest->id}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'low',
            'changes' => [
                'contact_request_id' => $contactRequest->id,
                'attachment_id' => $attachment->id,
                'filename' => $attachment->original_filename,
                'download_count' => $attachment->downloaded_count,
            ],
        ]);

        // ✅ Return file as download (decrypted in memory, not saved to disk)
        return response()->streamDownload(
            function () use ($decryptedContents) {
                echo $decryptedContents;
            },
            $attachment->original_filename,
            [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'attachment; filename="' . $attachment->original_filename . '"',
                'Content-Length' => strlen($decryptedContents),
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }
}
