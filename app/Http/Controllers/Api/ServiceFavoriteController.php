<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceFavorite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ServiceFavoriteController extends Controller
{
    /**
     * Toggle favorite status for a service.
     */
    public function toggle(Service $service): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Check if already favorited
            $existingFavorite = ServiceFavorite::where('user_id', $user->id)
                                             ->where('service_id', $service->id)
                                             ->first();

            if ($existingFavorite) {
                // Remove from favorites
                $existingFavorite->delete();

                Log::info('Service removed from favorites', [
                    'user_id' => $user->id,
                    'service_id' => $service->id,
                    'service_title' => $service->title
                ]);

                return response()->json([
                    'success' => true,
                    'favorited' => false,
                    'message' => 'Servicio eliminado de favoritos',
                    'favorites_count' => $service->fresh()->favorites_count
                ]);
            } else {
                // Add to favorites
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
                    'message' => 'Servicio añadido a favoritos',
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
                'message' => 'Error al procesar la solicitud'
            ], 500);
        }
    }

    /**
     * Get user's favorite services.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
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
                'message' => 'Error al obtener favoritos'
            ], 500);
        }
    }

    /**
     * Check if a service is favorited by the current user.
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
                'message' => 'Error al verificar estado de favorito'
            ], 500);
        }
    }
}
