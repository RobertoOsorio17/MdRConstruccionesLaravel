<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Comment;
use App\Models\CommentInteraction;
use App\Models\CommentReport;
use App\Models\AdminAuditLog;
use App\Events\CommentReported;

/**
 * Coordinates like, dislike, and report interactions on comments for authenticated and guest users.
 *
 * Features:
 * - Like/dislike toggles with mutual exclusion and counter updates.
 * - Report endpoint with XSS sanitization, duplicate/spam detection, audit logging, and events.
 * - Authorization hooks via policies for consistent access control.
 */
class CommentInteractionController extends Controller
{
    use AuthorizesRequests;
    /**
     * Store a like interaction for a comment.
     *
     * @param Request $request The current HTTP request instance.
     * @param Comment $comment The comment being liked or unliked.
     * @return JsonResponse JSON response including current like/dislike counts.
     */
    public function like(Request $request, Comment $comment): JsonResponse
    {
        // Authorize the action using policy.
        $this->authorize('like', $comment);

        $user = Auth::user();

        // Check whether an interaction of the same type already exists.
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'like')
            ->first();
            
        if ($existingInteraction) {
            // Toggle off the interaction when it already exists.
            $existingInteraction->delete();
            $message = 'Like removed.';
            $liked = false;
        } else {
            // Remove any existing dislike before saving the like.
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'dislike')
                ->delete();
                
            // Record the new like interaction.
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'like'
            ]);
            
            $message = 'Comment marked as helpful.';
            $liked = true;
        }
        
        // Retrieve the latest interaction counters.
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'liked' => $liked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Store a dislike interaction for a comment.
     *
     * @param Request $request The current HTTP request instance.
     * @param Comment $comment The comment being disliked or undisliked.
     * @return JsonResponse JSON response including current like/dislike counts.
     */
    public function dislike(Request $request, Comment $comment): JsonResponse
    {
        // Authorize the action using policy (same rules as like).
        $this->authorize('like', $comment);

        $user = Auth::user();

        // Check whether an interaction of the same type already exists.
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'dislike')
            ->first();
            
        if ($existingInteraction) {
            // Toggle off the interaction when it already exists.
            $existingInteraction->delete();
            $message = 'Dislike removed.';
            $disliked = false;
        } else {
            // Remove any existing like before saving the dislike.
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'like')
                ->delete();
                
            // Record the new dislike interaction.
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'dislike'
            ]);
            
            $message = 'Comment marked as not helpful.';
            $disliked = true;
        }
        
        // Retrieve the latest interaction counters.
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'disliked' => $disliked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Report a comment.
     *
     * Security features:
     * - Input sanitization to prevent XSS.
     * - Duplicate report detection (per user/IP).
     * - Spam detection (multiple reports from same user).
     * - Automatic priority assignment based on category.
     * - Audit logging for all reports.
     * - Event dispatching for moderator notifications.
     *
     * @param Request $request The current HTTP request instance.
     * @param Comment $comment The comment being reported.
     * @return JsonResponse JSON response indicating success or failure.
     */
    public function report(Request $request, Comment $comment): JsonResponse
    {
        // Security: Validate and sanitize inputs.
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'category' => 'nullable|string|in:spam,harassment,hate_speech,inappropriate,misinformation,off_topic,other',
            'description' => 'nullable|string|max:1000'
        ]);

        // Security: Sanitize text inputs to prevent XSS.
        $sanitizedReason = strip_tags($validated['reason']);
        $sanitizedDescription = $validated['description'] ? strip_tags($validated['description']) : null;
        $category = $validated['category'] ?? 'other';

        $user = Auth::user();
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        // Security: Check for duplicate reports.
        $existingReportQuery = CommentReport::where('comment_id', $comment->id);

        if ($user) {
            // Authenticated user: constrain by the authenticated user identifier.
            $existingReportQuery->where('user_id', $user->id);
        } else {
            // Guest user: limit repeated reports from the same IP within the last 24 hours.
            $existingReportQuery->where('ip_address', $ipAddress)
                               ->where('created_at', '>', now()->subDay());
        }

        $existingReport = $existingReportQuery->first();

        if ($existingReport) {
            $message = $user
                ? 'Ya has reportado este comentario anteriormente.'
                : 'Este comentario ya fue reportado desde esta ubicación en las últimas 24 horas.';

            // Audit: Log duplicate report attempt.
            Log::warning('Duplicate comment report attempt', [
                'comment_id' => $comment->id,
                'user_id' => $user?->id,
                'ip_address' => $ipAddress,
                'category' => $category
            ]);

            return response()->json([
                'success' => false,
                'message' => $message
            ], 400);
        }

        // Security: Detect report spam (same user reporting many comments).
        if ($user) {
            $recentReportsCount = CommentReport::where('user_id', $user->id)
                ->where('created_at', '>', now()->subHour())
                ->count();

            if ($recentReportsCount >= 5) {
                Log::warning('Report spam detected', [
                    'user_id' => $user->id,
                    'recent_reports' => $recentReportsCount,
                    'ip_address' => $ipAddress
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Has reportado demasiados comentarios recientemente. Por favor, espera antes de reportar más.'
                ], 429);
            }
        } else {
            // For guests, check IP-based spam
            $recentIpReportsCount = CommentReport::where('ip_address', $ipAddress)
                ->where('created_at', '>', now()->subHour())
                ->count();

            if ($recentIpReportsCount >= 3) {
                Log::warning('Guest report spam detected', [
                    'ip_address' => $ipAddress,
                    'recent_reports' => $recentIpReportsCount
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Se han reportado demasiados comentarios desde esta ubicación. Por favor, espera antes de reportar más.'
                ], 429);
            }
        }

        // Feature: Automatic priority assignment based on category severity.
        $priority = $this->calculateReportPriority($category);

        // Security: Persist the new report entry with sanitized data.
        $report = CommentReport::create([
            'user_id' => $user?->id,
            'comment_id' => $comment->id,
            'reason' => $sanitizedReason,
            'category' => $category,
            'description' => $sanitizedDescription,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'is_guest_report' => !$user,
            'priority' => $priority
        ]);

        // Audit: Log report creation.
        AdminAuditLog::logAction([
            'action' => 'report_comment',
            'model_type' => CommentReport::class,
            'model_id' => $report->id,
            'severity' => $priority === 'high' ? 'high' : 'medium',
            'description' => $user
                ? "User {$user->name} reported comment #{$comment->id} for {$category}"
                : "Guest (IP: {$ipAddress}) reported comment #{$comment->id} for {$category}",
            'metadata' => [
                'comment_id' => $comment->id,
                'report_id' => $report->id,
                'category' => $category,
                'priority' => $priority,
                'reporter_type' => $user ? 'user' : 'guest',
                'post_id' => $comment->post_id
            ]
        ]);

        // Feature: Dispatch event for moderator notifications.
        event(new CommentReported($report));

        // Feature: Invalidate reports cache.
        Cache::forget('comment_reports_stats');

        $successMessage = $user
            ? 'Comentario reportado exitosamente. Nuestro equipo lo revisará pronto.'
            : 'Comentario reportado exitosamente. Recuerda que los reportes falsos pueden resultar en el bloqueo de tu IP.';

        return response()->json([
            'success' => true,
            'message' => $successMessage
        ]);
    }

    /**
     * Calculate report priority based on category severity.
     *
     * @param string $category Report category
     * @return string Priority level (high, medium, low)
     */
    private function calculateReportPriority(string $category): string
    {
        return match($category) {
            'hate_speech', 'harassment' => 'high',
            'spam', 'inappropriate', 'misinformation' => 'medium',
            'off_topic', 'other' => 'low',
            default => 'low'
        };
    }
}





