<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Manage blog tags within the admin panel.
 */
class TagController extends Controller
{
    /**
     * Display a listing of tags.
     */
    public function index(Request $request)
    {
        $query = Tag::withCount('posts');

        // Apply keyword filtering.
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $tags = $query->orderBy('name')
            ->paginate(15)
            ->through(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                    'posts_count' => $tag->posts_count,
                    'created_at' => $tag->created_at->format('d/m/Y H:i'),
                    'updated_at' => $tag->updated_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Admin/Tags/Index', [
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
            ],
            'stats' => [
                'total' => Tag::count(),
                'with_posts' => Tag::has('posts')->count(),
                'without_posts' => Tag::doesntHave('posts')->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new tag.
     */
    public function create()
    {
        return Inertia::render('Admin/Tags/Create');
    }

    /**
     * Store a newly created tag.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
            'color' => 'required|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
        ]);

        // Generate slug if not provided.
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure uniqueness.
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Tag::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        Tag::create($validated);

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag created successfully.');
    }

    /**
     * Display the specified tag.
     */
    public function show(Tag $tag)
    {
        $tag->loadCount('posts');

        return Inertia::render('Admin/Tags/Show', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'color' => $tag->color,
                'posts_count' => $tag->posts_count,
                'created_at' => $tag->created_at->format('d/m/Y H:i'),
                'updated_at' => $tag->updated_at->format('d/m/Y H:i'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified tag.
     */
    public function edit(Tag $tag)
    {
        return Inertia::render('Admin/Tags/Edit', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'color' => $tag->color,
            ]
        ]);
    }

    /**
     * Update the specified tag.
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('tags')->ignore($tag->id)],
            'color' => 'required|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
        ]);

        // Generate slug if not provided.
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure uniqueness.
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Tag::where('slug', $validated['slug'])->where('id', '!=', $tag->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $tag->update($validated);

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified tag.
     */
    public function destroy(Tag $tag)
    {
        // Prevent deletion when posts still reference the tag.
        if ($tag->posts()->count() > 0) {
            return redirect()->route('admin.tags.index')
                ->with('error', 'This tag cannot be removed because posts are still linked to it.');
        }

        $tag->delete();

        return redirect()->route('admin.tags.index')
            ->with('success', 'Tag deleted successfully.');
    }

    /**
     * Bulk delete unused tags
     */
    public function bulkDeleteUnused()
    {
        $deletedCount = Tag::doesntHave('posts')->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $deletedCount,
            'message' => "{$deletedCount} unused tag(s) deleted."
        ]);
    }
}
