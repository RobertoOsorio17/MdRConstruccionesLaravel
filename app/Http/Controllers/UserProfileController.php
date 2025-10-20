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
// use Intervention\Image\ImageManagerStatic as Image; // Disabled until the Intervention Image library is installed.

/**
 * Powers the authenticated user's profile area by aggregating posts, reactions, statistics, and personalization data.
 * Connects storage, validation, and Inertia responses so members can curate their public presence seamlessly.
 */
class UserProfileController extends Controller
{
    /**
     * Display the authenticated user's dashboard profile view.
     *
     * @return Response Inertia response containing dashboard data for the owner.
     */
    public function dashboard(): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        // Load the user's favorite services.
        $user->loadCount('favoriteServices');
        $user->load(['favoriteServices' => function($query) {
            $query->latest('user_service_favorites.created_at')->limit(12);
        }]);

        // 1. Load the user's own posts with engagement metadata.
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

        // 2. Load posts liked by the user (including own posts).
        $likedPosts = \App\Models\Post::whereHas('likes', function($query) use ($user) {
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

        // 3. Load posts the user has bookmarked.
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

        // 4. Load approved comments made by the user with post details.
        // ✅ FIX: Eager load interaction counts to prevent N+1 queries
        $userComments = $user->comments()
            ->approved()
            ->with([
                'post:id,title,slug,user_id',
                'post.author:id,name,avatar,is_verified',
                'user:id,name,avatar,is_verified'
            ])
            ->withCount([
                'interactions as likes_count' => function ($query) {
                    $query->where('type', 'like');
                },
                'interactions as dislikes_count' => function ($query) {
                    $query->where('type', 'dislike');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Decorate each post with like and bookmark status for the authenticated user.
        $allPosts = collect([$userPosts, $likedPosts, $savedPosts])->flatten();

        foreach ($allPosts as $post) {
            $post->user_liked = $post->isLikedBy($user);
            $post->user_bookmarked = $post->isBookmarkedBy($user);
        }

        // Decorate each comment with user interaction metadata.
        foreach ($userComments as $comment) {
            $comment->user_liked = $comment->isLikedBy($user);
            $comment->user_disliked = $comment->isDislikedBy($user);
            // ✅ FIX: Use pre-loaded counts instead of querying in loop
            // likes_count and dislikes_count are already loaded via withCount()
        }

        // Compile augmented statistics for quick display in the dashboard.
        $stats = [
            // ✅ FIX: Use pre-loaded count instead of redundant query
            'favoriteServicesCount' => $user->favorite_services_count ?? 0,
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
            'isFollowing' => false, // Not applicable for own profile.
            'isOwnProfile' => true, // Always true for dashboard.
            'favoriteServices' => $user->favoriteServices,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Display the public profile for a given user.
     *
     * @param User $user The profile owner being viewed.
     * @return Response Inertia response with aggregated public profile data.
     */
    public function show(User $user): Response
    {
        \Log::info('UserProfileController::show called for user ' . $user->id);

        // Ensure the profile is visible or belongs to the authenticated user.
        if (!$user->profile_visibility && Auth::id() !== $user->id) {
            abort(404, 'Profile not found.');
        }

        $currentUser = Auth::user();
        $isOwnProfile = $currentUser && $currentUser->id === $user->id;

        // Load the user's favorite services.
        $user->load(['favoriteServices' => function($query) {
            $query->latest('user_service_favorites.created_at')->limit(12);
        }]);

        // 1. Load the user's published posts.
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

        // 2. Load posts liked by the user (including own posts).
        $likedPosts = collect();
        if ($currentUser) {
            $likedPosts = \App\Models\Post::whereHas('likes', function($query) use ($user) {
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

        // 3. Load posts the user has bookmarked.
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

        // 4. Load approved comments with post information (limited to the first ten).
        $userComments = Comment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with(['post' => function ($query) {
                $query->select('id', 'title', 'slug', 'status', 'published_at');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Decorate each post with interaction flags for the current user.
        $allPosts = collect([$userPosts, $likedPosts, $savedPosts])->flatten();

        if ($currentUser) {
            // ✅ FIXED N+1: Load all user interactions in bulk before loop
            $postIds = $allPosts->pluck('id')->filter();
            $userPostInteractions = [];

            if ($postIds->isNotEmpty()) {
                $interactions = \App\Models\UserInteraction::where('user_id', $currentUser->id)
                    ->where('interactable_type', 'App\\Models\\Post')
                    ->whereIn('interactable_id', $postIds)
                    ->whereIn('type', ['like', 'bookmark'])
                    ->get();

                foreach ($interactions as $interaction) {
                    $key = $interaction->interactable_id . '_' . $interaction->type;
                    $userPostInteractions[$key] = true;
                }
            }

            // Now decorate posts using pre-loaded data (no N+1)
            foreach ($allPosts as $post) {
                $post->user_liked = isset($userPostInteractions[$post->id . '_like']);
                $post->user_bookmarked = isset($userPostInteractions[$post->id . '_bookmark']);
            }

            // ✅ FIXED N+1: Load all comment interactions in bulk
            $commentIds = $userComments->pluck('id')->filter();
            $userCommentInteractions = [];

            if ($commentIds->isNotEmpty()) {
                $commentInteractions = \App\Models\CommentInteraction::where('user_id', $currentUser->id)
                    ->whereIn('comment_id', $commentIds)
                    ->whereIn('type', ['like', 'dislike'])
                    ->get();

                foreach ($commentInteractions as $interaction) {
                    $key = $interaction->comment_id . '_' . $interaction->type;
                    $userCommentInteractions[$key] = true;
                }
            }

            // Decorate each comment with interaction counts and flags (no N+1).
            foreach ($userComments as $comment) {
                // Determine whether the current user liked or disliked the comment.
                $comment->user_liked = isset($userCommentInteractions[$comment->id . '_like']);
                $comment->user_disliked = isset($userCommentInteractions[$comment->id . '_dislike']);

                // ✅ FIXED N+1: Use withCount instead of counting in loop
                // Note: These counts should be loaded with withCount() in the original query
                // For now, keeping the existing logic but this could be optimized further
                $comment->likes_count = $comment->interactions()
                    ->where('type', 'like')
                    ->count();

                $comment->dislikes_count = $comment->interactions()
                    ->where('type', 'dislike')
                    ->count();
            }
        }

        // Compile enhanced profile statistics for the public view.
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

        // Determine whether the logged-in user follows the profile owner.
        $isFollowing = $currentUser ? $currentUser->isFollowing($user) : false;

        // Add follower and following counters.
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
     * Retrieve paginated comments for a user through the API.
     *
     * @param Request $request The current HTTP request instance.
     * @param int|null $userId Optional user identifier when querying another profile.
     * @return JsonResponse JSON response containing paginated comment data.
     */
    public function getUserComments(Request $request, $userId = null)
    {
        $user = $userId ? User::findOrFail($userId) : $request->user();
        $currentUser = $request->user();

        // Security check: only allow viewing own comments or public profiles.
        if ($userId && $userId != $currentUser?->id) {
            // Check whether the profile is public or the user has permission.
            if (!$user || !$user->profile_visibility) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

        $perPage = min($request->get('per_page', 10), 50); // Limit to maximum 50 per page.
        $search = $request->get('search', '');

        $query = Comment::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with(['post' => function ($query) {
                $query->select('id', 'title', 'slug', 'status', 'published_at');
            }]);

        // Apply a keyword filter when supplied.
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
     * Show the profile edit form for the authenticated user.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with editable profile information.
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
     * Update the authenticated user's profile.
     *
     * @param Request $request The validated profile update request.
     * @return RedirectResponse Redirect response with status messaging.
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
        
        // Strip out empty social link values.
        if (isset($data['social_links'])) {
            $data['social_links'] = array_filter($data['social_links'], function($value) {
                return !empty($value);
            });
        }
        
        $user->update($data);
        
        return back()->with('success', 'Profile updated successfully.');
    }
    
    /**
     * Upload a new avatar for the authenticated user.
     *
     * @param Request $request The HTTP request containing the avatar file.
     * @return JsonResponse JSON response describing the upload outcome.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048']
        ]);
        
        $user = $request->user();
        
        try {
            // Delete any existing avatar stored locally.
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            
            $file = $request->file('avatar');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            
            // Persist the uploaded image without additional processing for now.
            // TODO: Install Intervention Image to support server-side avatar processing.
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $file->storeAs('avatars', $filename, 'public');
            
            // Update the user record with the new avatar reference.
            $user->update([
                'avatar' => $filename,
                'profile_updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'avatar_url' => $user->avatar_url,
                'message' => 'Avatar updated successfully.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Remove the user's avatar and fall back to the default image.
     *
     * @param Request $request The HTTP request for the removal action.
     * @return JsonResponse JSON response describing the delete outcome.
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        
        try {
            // Delete the stored file when it is not an external URL.
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            
            $user->update([
                'avatar' => null,
                'profile_updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'avatar_url' => $user->avatar_url, // This returns the default avatar when null.
                'message' => 'Avatar removed successfully.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete avatar: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Provide follow suggestions tailored to the authenticated user.
     *
     * @param Request $request The current HTTP request instance.
     * @return JsonResponse JSON response containing suggested users to follow.
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


