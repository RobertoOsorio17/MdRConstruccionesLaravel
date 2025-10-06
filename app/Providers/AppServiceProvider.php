<?php

namespace App\Providers;

use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Models\ContactRequest;
use App\Observers\PostObserver;
use App\Observers\CategoryObserver;
use App\Observers\CommentObserver;
use App\Observers\ContactRequestObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Fix for MySQL index key length
        Schema::defaultStringLength(191);

        // ✅ Register model observers for automatic cache invalidation and logging
        Post::observe(PostObserver::class);
        Category::observe(CategoryObserver::class);
        Comment::observe(CommentObserver::class);
        ContactRequest::observe(ContactRequestObserver::class);
    }
}
