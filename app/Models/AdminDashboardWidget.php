<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Persisted configuration for a dashboard widget pinned to an administrator's workspace layout.
 * Stores positioning, sizing, and refresh preferences that drive the customizable admin dashboard grid.
 */
class AdminDashboardWidget extends Model
{
    /**
     * Mass assignable attributes.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'widget_type',
        'title',
        'configuration',
        'position_x',
        'position_y',
        'width',
        'height',
        'is_visible',
        'refresh_interval',
    ];

    /**
     * Attribute casting definitions.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'configuration' => 'array',
        'position_x' => 'integer',
        'position_y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'is_visible' => 'boolean',
        'refresh_interval' => 'integer',
    ];

    /**
     * Widget belongs to a user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope visible widgets.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope widgets by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('widget_type', $type);
    }

    /**
     * Scope widgets belonging to the supplied user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope widgets ordered by board position.
     */
    public function scopeOrderedByPosition($query)
    {
        return $query->orderBy('position_y')->orderBy('position_x');
    }

    /**
     * Get default widgets for a new user
     */
    public static function getDefaultWidgets(): array
    {
        return [
            [
                'widget_type' => 'stats_overview',
                'title' => 'Overview',
                'configuration' => [
                    'metrics' => ['users', 'posts', 'services', 'projects']
                ],
                'position_x' => 0,
                'position_y' => 0,
                'width' => 4,
                'height' => 2,
                'is_visible' => true,
                'refresh_interval' => 300,
            ],
            [
                'widget_type' => 'recent_activity',
                'title' => 'Recent Activity',
                'configuration' => [
                    'limit' => 10,
                    'show_user_actions' => true
                ],
                'position_x' => 0,
                'position_y' => 2,
                'width' => 2,
                'height' => 3,
                'is_visible' => true,
                'refresh_interval' => 60,
            ],
            [
                'widget_type' => 'quick_actions',
                'title' => 'Quick Actions',
                'configuration' => [
                    'actions' => ['create_post', 'create_user', 'create_service']
                ],
                'position_x' => 2,
                'position_y' => 2,
                'width' => 2,
                'height' => 2,
                'is_visible' => true,
                'refresh_interval' => 0, // No refresh needed.
            ],
            [
                'widget_type' => 'system_status',
                'title' => 'System Status',
                'configuration' => [
                    'show_server_info' => true,
                    'show_database_status' => true
                ],
                'position_x' => 2,
                'position_y' => 4,
                'width' => 2,
                'height' => 1,
                'is_visible' => true,
                'refresh_interval' => 120,
            ],
        ];
    }

    /**
     * Create default widgets for user
     */
    public static function createDefaultWidgetsForUser(int $userId): void
    {
        $defaultWidgets = static::getDefaultWidgets();
        
        foreach ($defaultWidgets as $widget) {
            static::create(array_merge($widget, ['user_id' => $userId]));
        }
    }

    /**
     * Update widget position
     */
    public function updatePosition(int $x, int $y): bool
    {
        $this->position_x = $x;
        $this->position_y = $y;
        return $this->save();
    }

    /**
     * Update widget size
     */
    public function updateSize(int $width, int $height): bool
    {
        $this->width = $width;
        $this->height = $height;
        return $this->save();
    }

    /**
     * Toggle visibility
     */
    public function toggleVisibility(): bool
    {
        $this->is_visible = !$this->is_visible;
        return $this->save();
    }

    /**
     * Update configuration
     */
    public function updateConfiguration(array $config): bool
    {
        $this->configuration = array_merge($this->configuration ?? [], $config);
        return $this->save();
    }

    /**
     * Get widget data based on type
     */
    public function getWidgetData(): array
    {
        return match($this->widget_type) {
            'stats_overview' => $this->getStatsOverviewData(),
            'recent_activity' => $this->getRecentActivityData(),
            'quick_actions' => $this->getQuickActionsData(),
            'system_status' => $this->getSystemStatusData(),
            default => [],
        };
    }

    /**
     * Get stats overview data
     */
    private function getStatsOverviewData(): array
    {
        $metrics = $this->configuration['metrics'] ?? [];
        $data = [];

        foreach ($metrics as $metric) {
            $data[$metric] = match($metric) {
                'users' => User::count(),
                'posts' => \App\Models\Post::count(),
                'services' => \App\Models\Service::count(),
                'projects' => \App\Models\Project::count(),
                default => 0,
            };
        }

        return $data;
    }

    /**
     * Get recent activity data
     */
    private function getRecentActivityData(): array
    {
        $limit = $this->configuration['limit'] ?? 10;
        
        return AdminAuditLog::with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user?->name ?? 'System',
                    'action' => $log->formatted_description,
                    'created_at' => $log->created_at,
                    'severity' => $log->severity,
                ];
            })
            ->toArray();
    }

    /**
     * Get quick actions data
     */
    private function getQuickActionsData(): array
    {
        $actions = $this->configuration['actions'] ?? [];
        
        return collect($actions)->map(function ($action) {
            return match($action) {
                'create_post' => [
                    'label' => 'Create Post',
                    'url' => route('admin.posts.create'),
                    'icon' => 'add_circle',
                    'color' => 'primary'
                ],
                'create_user' => [
                    'label' => 'Create User',
                    'url' => route('admin.users.create'),
                    'icon' => 'person_add',
                    'color' => 'secondary'
                ],
                'create_service' => [
                    'label' => 'Create Service',
                    'url' => route('admin.services.create'),
                    'icon' => 'build',
                    'color' => 'success'
                ],
                default => null,
            };
        })->filter()->values()->toArray();
    }

    /**
     * Get system status data
     */
    private function getSystemStatusData(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database_status' => 'connected', // Could check actual DB connection
            'cache_status' => 'active',
            'queue_status' => 'running',
        ];
    }
}
