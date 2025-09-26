<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
// use Intervention\Image\ImageManagerStatic as Image; // Comentado hasta instalar la librería

class UserProfileController extends Controller
{
    /**
     * Mostrar el dashboard del usuario autenticado (su propio perfil)
     */
    public function dashboard(): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        // Cargar servicios favoritos del usuario
        $user->load(['favoriteServices' => function($query) {
            $query->latest('user_service_favorites.created_at')->limit(12);
        }]);

        $stats = [
            'favoriteServicesCount' => $user->favoriteServices()->count(),
            'joinedDate' => $user->created_at->format('Y-m-d'),
            'profileCompleteness' => $user->profile_completeness ?? 0,
            'lastActivity' => $user->updated_at->format('Y-m-d'),
        ];

        return Inertia::render('User/Profile', [
            'profileUser' => $user,
            'stats' => $stats,
            'isFollowing' => false, // Not applicable for own profile
            'isOwnProfile' => true, // Always true for dashboard
            'favoriteServices' => $user->favoriteServices,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Mostrar el perfil público de un usuario
     */
    public function show(User $user): Response
    {
        // Verificar si el perfil es visible o si es el propio usuario
        if (!$user->profile_visibility && Auth::id() !== $user->id) {
            abort(404, 'Perfil no encontrado');
        }

        // Cargar servicios favoritos del usuario
        $user->load(['favoriteServices' => function($query) {
            $query->latest('user_service_favorites.created_at')->limit(12);
        }]);

        $stats = [
            'favoriteServicesCount' => $user->favoriteServices()->count(),
            'joinedDate' => $user->created_at->format('Y-m-d'),
            'profileCompleteness' => $user->profile_completeness ?? 0,
            'lastActivity' => $user->updated_at->format('Y-m-d'),
        ];

        // TODO: Implementar verificación de following cuando el modelo esté listo
        $isFollowing = false;

        return Inertia::render('User/Profile', [
            'profileUser' => $user,
            'stats' => $stats,
            'isFollowing' => $isFollowing,
            'isOwnProfile' => Auth::id() === $user->id,
            'favoriteServices' => $user->favoriteServices,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
    
    /**
     * Mostrar formulario de edición del perfil
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('User/EditProfile', [
            'user' => $user,
            'profileCompleteness' => $user->profile_completeness,
            'socialLinks' => $user->social_links ?: []
        ]);
    }
    
    /**
     * Actualizar el perfil del usuario
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'location' => ['nullable', 'string', 'max:100'],
            'profession' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other', 'prefer_not_to_say'])],
            'social_links' => ['nullable', 'array'],
            'social_links.twitter' => ['nullable', 'url'],
            'social_links.linkedin' => ['nullable', 'url'],
            'social_links.facebook' => ['nullable', 'url'],
            'social_links.instagram' => ['nullable', 'url'],
            'social_links.github' => ['nullable', 'url'],
            'profile_visibility' => ['boolean'],
            'show_email' => ['boolean']
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $data = $validator->validated();
        $data['profile_updated_at'] = now();
        
        // Limpiar enlaces sociales vacíos
        if (isset($data['social_links'])) {
            $data['social_links'] = array_filter($data['social_links'], function($value) {
                return !empty($value);
            });
        }
        
        $user->update($data);
        
        return back()->with('success', 'Perfil actualizado correctamente');
    }
    
    /**
     * Subir avatar del usuario
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048']
        ]);
        
        $user = $request->user();
        
        try {
            // Eliminar avatar anterior si existe
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            
            $file = $request->file('avatar');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            // Por ahora guardar imagen sin procesar (TODO: instalar Intervention Image)
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $file->storeAs('avatars', $filename, 'public');
            
            // Actualizar usuario
            $user->update([
                'avatar' => $filename,
                'profile_updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'avatar_url' => $user->avatar_url,
                'message' => 'Avatar actualizado correctamente'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el avatar: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Eliminar avatar del usuario
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        
        try {
            // Eliminar archivo si no es URL externa
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            
            $user->update([
                'avatar' => null,
                'profile_updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'avatar_url' => $user->avatar_url, // Esto devolverá el avatar por defecto
                'message' => 'Avatar eliminado correctamente'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el avatar: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener sugerencias de usuarios para seguir
     */
    public function suggestions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $suggestions = User::where('id', '!=', $user->id)
            ->where('profile_visibility', true)
            ->whereNotIn('id', $user->following()->pluck('users.id'))
            ->withCount(['posts', 'followers'])
            ->orderByDesc('posts_count')
            ->orderByDesc('followers_count')
            ->limit(5)
            ->get();
            
        return response()->json([
            'suggestions' => $suggestions
        ]);
    }
}
