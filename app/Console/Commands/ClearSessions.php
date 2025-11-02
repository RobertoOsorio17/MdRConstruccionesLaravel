<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Session\CacheBasedSessionHandler;
use Illuminate\Session\DatabaseSessionHandler;
use Illuminate\Session\FileSessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

/**
 * Clears every persisted session for the configured session driver.
 * Useful after changing SESSION_SERIALIZATION / encryption settings.
 */
class ClearSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'session:clear {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove all stored sessions for the active session driver.';


    


    

    

    

    /**


    

    

    

     * Handle __construct.


    

    

    

     *


    

    

    

     * @param private readonly Filesystem $filesystem The filesystem.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    public function __construct(private readonly Filesystem $filesystem)
    {
        parent::__construct();
    }

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(): int
    {
        if (!$this->option('force')
            && !$this->confirm('This will log out every active user session. Continue?')
        ) {
            $this->info('Aborted. No sessions were cleared.');
            return self::SUCCESS;
        }

        /** @var Store $store */
        $store = App::make('session.store');
        $handler = $store->getHandler();

        if ($handler instanceof DatabaseSessionHandler) {
            $this->clearDatabaseSessions($handler);
        } elseif ($handler instanceof FileSessionHandler) {
            $this->clearFileSessions($handler);
        } elseif ($handler instanceof CacheBasedSessionHandler) {
            $this->clearCacheSessions($handler);
        } else {
            $driver = Config::get('session.driver');
            $this->error("The session driver [{$driver}] is not supported by session:clear.");
            return self::FAILURE;
        }

        $this->info('✅ All sessions have been cleared. Users will need to authenticate again.');

        return self::SUCCESS;
    }


    


    

    

    

    /**


    

    

    

     * Handle clear database sessions.


    

    

    

     *


    

    

    

     * @param DatabaseSessionHandler $handler The handler.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    private function clearDatabaseSessions(DatabaseSessionHandler $handler): void
    {
        $table = method_exists($handler, 'getTable') ? $handler->getTable() : Config::get('session.table', 'sessions');

        DB::table($table)->truncate();

        $this->line("• Truncated database session table [{$table}]");
    }


    


    

    

    

    /**


    

    

    

     * Handle clear file sessions.


    

    

    

     *


    

    

    

     * @param FileSessionHandler $handler The handler.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    private function clearFileSessions(FileSessionHandler $handler): void
    {
        $path = $handler->getPath();

        if (!$this->filesystem->exists($path)) {
            $this->warn("• Session directory [{$path}] does not exist; nothing to remove.");
            return;
        }

        $this->filesystem->cleanDirectory($path);

        $this->line("• Emptied session directory [{$path}]");
    }


    


    

    

    

    /**


    

    

    

     * Handle clear cache sessions.


    

    

    

     *


    

    

    

     * @param CacheBasedSessionHandler $handler The handler.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    private function clearCacheSessions(CacheBasedSessionHandler $handler): void
    {
        $reflection = new \ReflectionClass($handler);
        $property = $reflection->getProperty('cache');
        $property->setAccessible(true);

        /** @var Repository $cache */
        $cache = $property->getValue($handler);

        $cache->clear();

        $this->line('• Cleared cache repository backing the session driver');
    }
}
