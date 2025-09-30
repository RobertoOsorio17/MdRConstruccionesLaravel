<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Comment;
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

        // 1. Cargar posts del usuario (solo sus propios posts)
        $userPosts = $user->posts()
            ->with([
                'author:id,name,avatar,bio,profession,is_verified',
                'categories:id,name,slug,color',
                'tags:id,name,slug,color'
            ])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Cargar posts que le gustan al usuario (de otros autores)
        $likedPosts = \App\Models\Post::whereHas('likes', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('user_id', '!=', $user->id) // Excluir sus propios posts
        ->published()
        ->with([
            'author:id,name,avatar,bio,profession,is_verified',
            'categories:id,name,slug,color',
            'tags:id,name,slug,color'
        ])
        ->withCount(['likes', 'bookmarks', 'approvedComments'])
        ->orderBy('published_at', 'desc')
        ->get();

        // 3. Cargar posts guardados por el usuario
        $savedPosts = \App\Models\Post::whereHas('bookmarks', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->published()
        ->with([
            'author:id,name,avatar,bio,profession,is_verified',
            'categories:id,name,slug,color',
            'tags:id,name,slug,color'
        ])
        ->withCount(['likes', 'bookmarks', 'approvedComments'])
        ->orderBy('published_at', 'desc')
        ->get();

        // 4. Cargar comentarios del usuario con información del post
        $userComments = $user->comments()
            ->approved()
            ->with([
                'post:id,title,slug,user_id',
                'post.author:id,name,avatar,is_verified',
                'user:id,name,avatar,is_verified'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Agregar información de interacciones para todos los posts
        $allPosts = collect([$userPosts, $likedPosts, $savedPosts])->flatten();

        foreach ($allPosts as $post) {
            $post->user_liked = $post->isLikedBy($user);
            $post->user_bookmarked = $post->isBookmarkedBy($user);
        }

        // Agregar información de interacciones para comentarios
        foreach ($userComments as $comment) {
            $comment->user_liked = $comment->isLikedBy($user);
            $comment->user_disliked = $comment->isDislikedBy($user);
            $comment->likes_count = $comment->likes()->count();
            $comment->dislikes_count = $comment->dislikes()->count();
        }

        // Estadísticas mejoradas
        $stats = [
            'favoriteServicesCount' => $user->favoriteServices()->count(),
            'postsCount' => $userPosts->count(),
            'likedPostsCount' => $likedPosts->count(),
            'savedPostsCount' => $savedPosts->count(),
            'commentsCount' => $userComments->count(),
            'totalLikes' => $userPosts->sum('likes_count'),
            'totalComments' => $userPosts->sum('approved_comments_count'),
            'joinedDate' => $user->created_at->format('Y-m-d'),
            'profileCompleteness' => $user->profile_completeness ?? 0,
            'lastActivity' => $user->updated_at->format('Y-m-d'),
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
        ];

        return Inertia::render('User/Profile', [
            'profileUser' => $user,
            'userPosts' => $userPosts,
            'likedPosts' => $likedPosts,
            'savedPosts' => $savedPosts,
            'userComments' => $userComments,
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
        \Log::info('UserProfileController::show called for user ' . $user->id);

        // Verificar si el perfil es visible o si es el propio usuario
        if (!$user->profile_visibility && Auth::id() !== $user->id) {
            abort(404, 'Perfil no encontrado');
        }

        $currentUser = Auth::user();
        $isOwnProfile = $currentUser && $currentUser->id === $user->id;

        // Cargar servicios favoritos del usuario
        $user->load(['favoriteServices' => function($query) {
            $query->latest('user_service_favorites.created_at')->limit(12);
        }]);

        // 1. Cargar posts del usuario (solo sus propios posts)
        $userPosts = $user->posts()
            ->published()
            ->with([
                'author:id,name,avatar,bio,profession,is_verified',
                'categories:id,name,slug,color',
                'tags:id,name,slug,color'
            ])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->orderBy('published_at', 'desc')
            ->get();

        // 2. Cargar posts que le gustan al usuario (de otros autores)
        $likedPosts = collect();
        if ($currentUser) {
            $likedPosts = \App\Models\Post::whereHas('likes', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('user_id', '!=', $user->id) // Excluir sus propios posts
            ->published()
            ->with([
                'author:id,name,avatar,bio,profession,is_verified',
                'categories:id,name,slug,color',
                'tags:id,name,slug,color'
            ])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->orderBy('published_at', 'desc')
            ->get();
        }

        // 3. Cargar posts guardados por el usuario
        $savedPosts = collect();
        if ($currentUser) {
            $savedPosts = \App\Models\Post::whereHas('bookmarks', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->published()
            ->with([
                'author:id,name,avatar,bio,profession,is_verified',
                'categories:id,name,slug,color',
                'tags:id,name,slug,color'
            ])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->orderBy('published_at', 'desc')
            ->get();
        }

        // 4. Cargar comentarios del usuario con información del post (solo primeros 10 para la vista inicial)
        $userComments = Comment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with(['post' => function ($query) {
                $query->select('id', 'title', 'slug', 'status', 'published_at');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Agregar información de interacciones para todos los posts
        $allPosts = collect([$userPosts, $likedPosts, $savedPosts])->flatten();

        if ($currentUser) {
            foreach ($allPosts as $post) {
                $post->user_liked = $post->isLikedBy($currentUser);
                $post->user_bookmarked = $post->isBookmarkedBy($currentUser);
            }

            // Agregar información de interacciones para comentarios
            foreach ($userComments as $comment) {
                // Verificar si el usuario actual ha dado like/dislike al comentario
                $comment->user_liked = $comment->interactions()
                    ->where('user_id', $currentUser->id)
                    ->where('type', 'like')
                    ->exists();

                $comment->user_disliked = $comment->interactions()
                    ->where('user_id', $currentUser->id)
                    ->where('type', 'dislike')
                    ->exists();

                // Contar likes y dislikes
                $comment->likes_count = $comment->interactions()
                    ->where('type', 'like')
                    ->count();

                $comment->dislikes_count = $comment->interactions()
                    ->where('type', 'dislike')
                    ->count();
            }
        }

        // Estadísticas mejoradas
        $stats = [
            'favoriteServicesCount' => $user->favoriteServices()->count(),
            'postsCount' => $userPosts->count(),
            'likedPostsCount' => $likedPosts->count(),
            'savedPostsCount' => $savedPosts->count(),
            'commentsCount' => $userComments->count(),
            'totalLikes' => $userPosts->sum('likes_count'),
            'totalComments' => $userPosts->sum('approved_comments_count'),
            'joinedDate' => $user->created_at->format('Y-m-d'),
            'profileCompleteness' => $user->profile_completeness ?? 0,
            'lastActivity' => $user->updated_at->format('Y-m-d'),
        ];

        // Verificar si el usuario actual sigue al usuario del perfil
        $isFollowing = $currentUser ? $currentUser->isFollowing($user) : false;

        // Agregar contadores de seguidores y seguidos
        $stats['followersCount'] = $user->followers()->count();
        $stats['followingCount'] = $user->following()->count();

        \Log::info('About to render profile with userComments count: ' . $userComments->count());

        return Inertia::render('User/Profile', [
            'profileUser' => $user,
            'userPosts' => $userPosts,
            'likedPosts' => $likedPosts,
            'savedPosts' => $savedPosts,
            'userComments' => $userComments,
            'stats' => $stats,
            'isFollowing' => $isFollowing,
            'isOwnProfile' => $isOwnProfile,
            'favoriteServices' => $user->favoriteServices,
            'auth' => [
                'user' => $currentUser
            ]
        ]);
    }

    /**
     * Get paginated comments for a user (API endpoint)
     */
    public function getUserComments(Request $request, $userId = null)
    {
        $user = $userId ? User::findOrFail($userId) : $request->user();
        $currentUser = $request->user();

        // Security check: only allow viewing own comments or public profiles
        if ($userId && $userId != $currentUser?->id) {
            // Check if profile is public or if user has permission
            if (!$user || !$user->profile_visibility) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

        $perPage = min($request->get('per_page', 10), 50); // Limit to max 50 per page
        $search = $request->get('search', '');

        $query = Comment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with(['post' => function ($query) {
                $query->select('id', 'title', 'slug', 'status', 'published_at');
            }]);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhereHas('post', function ($postQuery) use ($search) {
                      $postQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        $comments = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'comments' => $comments
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


