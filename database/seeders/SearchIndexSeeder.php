<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Post;
use App\Models\Category;
use App\Models\User;

class SearchIndexSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating search indexes for better performance...');

        // Add full-text search indexes if they don't exist
        $this->createFullTextIndexes();
        
        // Populate search analytics with sample data
        $this->populateSearchAnalytics();
        
        // Create search suggestions based on existing content
        $this->createSearchSuggestions();

        $this->command->info('Search indexes created successfully!');
    }

    /**
     * Create full-text search indexes
     */
    private function createFullTextIndexes(): void
    {
        try {
            // Check if posts table has full-text index
            $postsIndexExists = DB::select("
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.STATISTICS 
                WHERE table_schema = DATABASE() 
                AND table_name = 'posts' 
                AND index_name = 'posts_fulltext_index'
            ");

            if ($postsIndexExists[0]->count == 0) {
                DB::statement('ALTER TABLE posts ADD FULLTEXT posts_fulltext_index (title, content, excerpt)');
                $this->command->info('✓ Full-text index created for posts table');
            } else {
                $this->command->info('✓ Full-text index already exists for posts table');
            }

            // Check if categories table has full-text index
            $categoriesIndexExists = DB::select("
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.STATISTICS 
                WHERE table_schema = DATABASE() 
                AND table_name = 'categories' 
                AND index_name = 'categories_fulltext_index'
            ");

            if ($categoriesIndexExists[0]->count == 0) {
                DB::statement('ALTER TABLE categories ADD FULLTEXT categories_fulltext_index (name, description)');
                $this->command->info('✓ Full-text index created for categories table');
            } else {
                $this->command->info('✓ Full-text index already exists for categories table');
            }

            // Check if users table has full-text index
            $usersIndexExists = DB::select("
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.STATISTICS 
                WHERE table_schema = DATABASE() 
                AND table_name = 'users' 
                AND index_name = 'users_fulltext_index'
            ");

            if ($usersIndexExists[0]->count == 0) {
                DB::statement('ALTER TABLE users ADD FULLTEXT users_fulltext_index (name, bio, profession)');
                $this->command->info('✓ Full-text index created for users table');
            } else {
                $this->command->info('✓ Full-text index already exists for users table');
            }

        } catch (\Exception $e) {
            $this->command->warn('Could not create full-text indexes: ' . $e->getMessage());
            $this->command->info('This is normal if you\'re not using MySQL or if indexes already exist.');
        }
    }

    /**
     * Populate search analytics with sample data
     */
    private function populateSearchAnalytics(): void
    {
        // Sample popular search terms
        $popularSearches = [
            'construcción',
            'reformas',
            'arquitectura',
            'diseño',
            'materiales',
            'presupuesto',
            'proyecto',
            'obra',
            'instalaciones',
            'decoración',
            'cocina',
            'baño',
            'jardín',
            'piscina',
            'terraza',
            'sostenible',
            'eficiencia energética',
            'smart home',
            'domótica',
            'seguridad'
        ];

        foreach ($popularSearches as $term) {
            // Create multiple entries with different timestamps
            for ($i = 0; $i < rand(5, 25); $i++) {
                DB::table('search_analytics')->insert([
                    'query' => $term,
                    'query_normalized' => strtolower(trim($term)),
                    'results_count' => rand(1, 50),
                    'user_ip' => $this->generateRandomIP(),
                    'user_agent' => $this->generateRandomUserAgent(),
                    'filters' => json_encode([
                        'category' => rand(0, 1) ? 'construccion' : null,
                        'sort' => ['recent', 'popular', 'relevant'][rand(0, 2)]
                    ]),
                    'response_time' => rand(50, 500) / 1000, // 0.05 to 0.5 seconds
                    'has_results' => rand(0, 10) > 1, // 90% have results
                    'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✓ Sample search analytics data created');
    }

    /**
     * Create search suggestions based on existing content
     */
    private function createSearchSuggestions(): void
    {
        // Get popular categories
        $categories = Category::select('name', 'slug')->get();
        
        // Get popular post titles (first 3 words)
        $posts = Post::select('title')
            ->where('status', 'published')
            ->limit(50)
            ->get();

        $suggestions = [];

        // Add category names as suggestions
        foreach ($categories as $category) {
            $suggestions[] = [
                'term' => $category->name,
                'type' => 'category',
                'popularity' => rand(10, 100),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Add post title keywords as suggestions
        foreach ($posts as $post) {
            $words = explode(' ', $post->title);
            $firstThreeWords = implode(' ', array_slice($words, 0, 3));
            
            if (strlen($firstThreeWords) > 3) {
                $suggestions[] = [
                    'term' => $firstThreeWords,
                    'type' => 'content',
                    'popularity' => rand(5, 50),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Create search_suggestions table if it doesn't exist
        if (!DB::getSchemaBuilder()->hasTable('search_suggestions')) {
            DB::statement('
                CREATE TABLE search_suggestions (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    term VARCHAR(191) NOT NULL,
                    type VARCHAR(50) DEFAULT "general",
                    popularity INT DEFAULT 1,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL,
                    INDEX idx_term (term),
                    INDEX idx_popularity (popularity)
                )
            ');
        }

        // Insert suggestions in batches
        $chunks = array_chunk($suggestions, 50);
        foreach ($chunks as $chunk) {
            DB::table('search_suggestions')->insert($chunk);
        }

        $this->command->info('✓ Search suggestions created');
    }

    /**
     * Generate random IP address
     */
    private function generateRandomIP(): string
    {
        return rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255);
    }

    /**
     * Generate random user agent
     */
    private function generateRandomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
        ];

        return $userAgents[array_rand($userAgents)];
    }
}
