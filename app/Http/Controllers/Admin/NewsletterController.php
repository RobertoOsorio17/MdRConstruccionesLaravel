<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\NewsletterExport;

/**
 * Oversees newsletter subscriber management, campaign exports, and outbound mailing actions for administrators.
 * Streamlines segmentation, verification, and compliance tracking to keep the mailing list healthy.
 */
class NewsletterController extends Controller
{
    /**
     * Display newsletter subscribers
     */
    public function index(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('newsletter.view')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate filters
        $validated = $request->validate([
            'status' => 'nullable|in:all,verified,unverified,unsubscribed',
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|in:recent,email,name',
        ]);

        $query = Newsletter::query();

        // Apply filters
        if ($request->filled('status')) {
            switch ($validated['status']) {
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

        if ($request->filled('search')) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sort = $validated['sort'] ?? 'recent';
        switch ($sort) {
            case 'email':
                $query->orderBy('email');
                break;
            case 'name':
                $query->orderBy('name');
                break;
            case 'recent':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        $subscribers = $query->paginate(50);

        // Get stats
        $stats = [
            'total' => Newsletter::count(),
            'verified' => Newsletter::verified()->active()->count(),
            'unverified' => Newsletter::unverified()->active()->count(),
            'unsubscribed' => Newsletter::whereNotNull('unsubscribed_at')->count(),
            'today' => Newsletter::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => $subscribers,
            'stats' => $stats,
            'filters' => $validated,
        ]);
    }

    /**
     * Send newsletter campaign
     */
    public function sendCampaign(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('newsletter.send')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'subject' => 'required|string|max:255|regex:/^[^<>]*$/',
            'content' => 'required|string|min:50',
            'recipients' => 'required|in:all,verified,preferences',
            'preferences' => 'nullable|array',
            'preferences.*' => 'string|in:news,projects,services,blog',
        ]);

        // Get recipients
        $query = Newsletter::active()->verified();

        if ($validated['recipients'] === 'preferences' && !empty($validated['preferences'])) {
            $query->where(function ($q) use ($validated) {
                foreach ($validated['preferences'] as $pref) {
                    $q->orWhereJsonContains('preferences', $pref);
                }
            });
        }

        $recipients = $query->get();

        if ($recipients->isEmpty()) {
            return back()->withErrors(['recipients' => 'No recipients found matching the criteria.']);
        }

        // Send emails
        $sent = 0;
        $failed = 0;

        foreach ($recipients as $subscriber) {
            try {
                Mail::send('emails.newsletter.campaign', [
                    'subscriber' => $subscriber,
                    'content' => $validated['content'],
                    'unsubscribeUrl' => route('newsletter.unsubscribe', $subscriber->token),
                ], function ($message) use ($subscriber, $validated) {
                    $message->to($subscriber->email, $subscriber->name)
                            ->subject($validated['subject']);
                });
                $sent++;
            } catch (\Exception $e) {
                $failed++;
                \Log::error('Failed to send newsletter campaign', [
                    'email' => $subscriber->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // ✅ Log campaign
        \Log::info('Newsletter campaign sent', [
            'admin_id' => auth()->id(),
            'subject' => $validated['subject'],
            'sent' => $sent,
            'failed' => $failed,
        ]);

        return back()->with('success', "Newsletter sent successfully to {$sent} subscribers. {$failed} failed.");
    }

    /**
     * Export subscribers
     */
    public function export(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('newsletter.export')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'status' => 'nullable|in:all,verified,unverified,unsubscribed',
        ]);

        $filters = [
            'status' => $validated['status'] ?? 'all',
        ];

        $filename = 'newsletter_subscribers_' . now()->format('Y-m-d_His') . '.' . $validated['format'];

        // ✅ Log export
        \Log::info('Newsletter subscribers exported', [
            'admin_id' => auth()->id(),
            'format' => $validated['format'],
            'filters' => $filters,
        ]);

        return Excel::download(new NewsletterExport($filters), $filename);
    }

    /**
     * Delete subscriber
     */
    public function destroy(Newsletter $newsletter)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('newsletter.delete')) {
            abort(403, 'Unauthorized action.');
        }

        $newsletter->delete();

        // ✅ Log deletion
        \Log::info('Newsletter subscriber deleted', [
            'admin_id' => auth()->id(),
            'email' => $newsletter->email,
        ]);

        return back()->with('success', 'Subscriber deleted successfully.');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('newsletter.manage')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'action' => 'required|in:delete,verify,unsubscribe',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:newsletters,id',
        ]);

        $count = 0;

        foreach ($validated['ids'] as $id) {
            $newsletter = Newsletter::find($id);
            if (!$newsletter) continue;

            switch ($validated['action']) {
                case 'delete':
                    $newsletter->delete();
                    $count++;
                    break;
                case 'verify':
                    if (!$newsletter->isVerified()) {
                        $newsletter->verify();
                        $count++;
                    }
                    break;
                case 'unsubscribe':
                    if (!$newsletter->isUnsubscribed()) {
                        $newsletter->unsubscribe();
                        $count++;
                    }
                    break;
            }
        }

        // ✅ Log bulk action
        \Log::info('Newsletter bulk action performed', [
            'admin_id' => auth()->id(),
            'action' => $validated['action'],
            'count' => $count,
        ]);

        return back()->with('success', "{$count} subscribers {$validated['action']}d successfully.");
    }
}

