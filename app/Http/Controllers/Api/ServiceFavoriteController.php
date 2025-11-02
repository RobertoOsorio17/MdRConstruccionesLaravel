<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceFavorite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Enables clients to favorite or unfavorite services through authenticated API endpoints enriched with telemetry.
 * Maintains consistency of favorite counts while producing meaningful responses for interactive user interfaces.
 */
class ServiceFavoriteController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle toggle.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function toggle(Service $service): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated user.'
                ], 401);
            }

            // Determine whether the service is already favorited.
            $existingFavorite = ServiceFavorite::where('user_id', $user->id)
                                             ->where('service_id', $service->id)
                                             ->first();

            if ($existingFavorite) {
                // Remove from favorites.
                $existingFavorite->delete();

                Log::info('Service removed from favorites', [
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                    'service_title' => $service->title
                ]);

                return response()->json([
                    'success' => true,
                    'favorited' => false,
                    'message' => 'Service removed from favorites.',
                    'favorites_count' => $service->fresh()->favorites_count
                ]);
            } else {
                // Add to favorites.
                ServiceFavorite::create([
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                ]);

                Log::info('Service added to favorites', [
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                    'service_title' => $service->title
                ]);

                return response()->json([
                    'success' => true,
                    'favorited' => true,
                    'message' => 'Service added to favorites.',
                    'favorites_count' => $service->fresh()->favorites_count
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error toggling service favorite', [
                'user_id' => Auth::id(),
                'service_id' => $service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process favorite request.'
            ], 500);
        }
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated user.'
                ], 401);
            }

            $favorites = $user->favoriteServices()
                             ->active()
                             ->get()
                             ->map(function ($service) {
                                 return [
                                     'id' => $service->id,
                                     'title' => $service->title,
                                     'slug' => $service->slug,
                                     'excerpt' => $service->excerpt,
                                     'icon' => $service->icon,
                                     'featured' => $service->featured,
                                     'favorited_at' => $service->pivot->created_at->format('Y-m-d H:i:s'),
                                 ];
                             });

            return response()->json([
                'success' => true,
                'favorites' => $favorites,
                'count' => $favorites->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user favorites', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch favorites.'
            ], 500);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle check.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function check(Service $service): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => true,
                    'favorited' => false
                ]);
            }

            $favorited = $user->hasFavorited($service);

            return response()->json([
                'success' => true,
                'favorited' => $favorited,
                'favorites_count' => $service->favorites_count
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking service favorite status', [
                'user_id' => Auth::id(),
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify favorite status.'
            ], 500);
        }
    }
}
