<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContactRequestController extends Controller
{
    /**
     * Display a listing of contact requests
     */
    public function index(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.view')) {
            abort(403, 'Unauthorized action.');
        }

        $query = ContactRequest::with('respondedBy:id,name');

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

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

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
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.view')) {
            abort(403, 'Unauthorized action.');
        }

        $contactRequest->load('respondedBy:id,name');

        // Auto-mark as read if it's new
        if ($contactRequest->status === 'new') {
            $contactRequest->markAsRead();
        }

        return Inertia::render('Admin/ContactRequests/Show', [
            'request' => $contactRequest,
        ]);
    }

    /**
     * Mark as read
     */
    public function markAsRead(ContactRequest $contactRequest)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.manage')) {
            abort(403, 'Unauthorized action.');
        }

        $contactRequest->markAsRead();

        return back()->with('success', 'Solicitud marcada como leída.');
    }

    /**
     * Mark as responded
     */
    public function markAsResponded(ContactRequest $contactRequest)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.manage')) {
            abort(403, 'Unauthorized action.');
        }

        $contactRequest->markAsResponded(auth()->id());

        return back()->with('success', 'Solicitud marcada como respondida.');
    }

    /**
     * Archive request
     */
    public function archive(ContactRequest $contactRequest)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.manage')) {
            abort(403, 'Unauthorized action.');
        }

        $contactRequest->archive();

        return back()->with('success', 'Solicitud archivada.');
    }

    /**
     * Add admin notes
     */
    public function addNotes(Request $request, ContactRequest $contactRequest)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.manage')) {
            abort(403, 'Unauthorized action.');
        }

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
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.delete')) {
            abort(403, 'Unauthorized action.');
        }

        $contactRequest->delete();

        return back()->with('success', 'Solicitud eliminada exitosamente.');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.manage')) {
            abort(403, 'Unauthorized action.');
        }

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
     * Download attachment from contact request
     */
    public function downloadAttachment(ContactRequest $contactRequest, int $index)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('contact.view')) {
            abort(403, 'Unauthorized action.');
        }

        // Check if attachments exist
        if (!$contactRequest->attachments || !isset($contactRequest->attachments[$index])) {
            abort(404, 'Archivo no encontrado.');
        }

        $attachment = $contactRequest->attachments[$index];

        // Verify file exists in storage
        if (!Storage::disk('private')->exists($attachment['path'])) {
            abort(404, 'Archivo no encontrado en el almacenamiento.');
        }

        // Return file download response
        return Storage::disk('private')->download(
            $attachment['path'],
            $attachment['original_name']
        );
    }
}
