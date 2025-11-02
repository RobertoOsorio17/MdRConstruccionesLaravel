<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Toggles the `.env` database configuration between SQLite and MySQL profiles for local development.
 * Streamlines environment switches without manual editing of connection credentials.
 */
class SwitchDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:switch {type : Database type (sqlite|mysql)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Switch between SQLite and MySQL database configurations';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        $type = $this->argument('type');
        $envPath = base_path('.env');
        
        if (!File::exists($envPath)) {
            $this->error('.env file not found!');
            return Command::FAILURE;
        }

        $envContent = File::get($envPath);

        switch ($type) {
            case 'sqlite':
                $this->info('Switching to SQLite...');
                $envContent = preg_replace('/^DB_CONNECTION=.*$/m', 'DB_CONNECTION=sqlite', $envContent);
                $envContent = preg_replace('/^DB_HOST=.*$/m', '# DB_HOST=127.0.0.1', $envContent);
                $envContent = preg_replace('/^DB_PORT=.*$/m', '# DB_PORT=3306', $envContent);
                $envContent = preg_replace('/^DB_DATABASE=.*$/m', '# DB_DATABASE=mdrconstrucciones', $envContent);
                $envContent = preg_replace('/^DB_USERNAME=.*$/m', '# DB_USERNAME=root', $envContent);
                $envContent = preg_replace('/^DB_PASSWORD=.*$/m', '# DB_PASSWORD=', $envContent);
                break;

            case 'mysql':
                $this->info('Switching to MySQL...');
                $envContent = preg_replace('/^DB_CONNECTION=.*$/m', 'DB_CONNECTION=mysql', $envContent);
                $envContent = preg_replace('/^# DB_HOST=.*$/m', 'DB_HOST=127.0.0.1', $envContent);
                $envContent = preg_replace('/^# DB_PORT=.*$/m', 'DB_PORT=3306', $envContent);
                $envContent = preg_replace('/^# DB_DATABASE=.*$/m', 'DB_DATABASE=mdrconstrucciones', $envContent);
                $envContent = preg_replace('/^# DB_USERNAME=.*$/m', 'DB_USERNAME=root', $envContent);
                $envContent = preg_replace('/^# DB_PASSWORD=.*$/m', 'DB_PASSWORD=', $envContent);
                break;

            default:
                $this->error('Invalid database type. Use: sqlite or mysql');
                return Command::FAILURE;
        }

        File::put($envPath, $envContent);
        $this->info("Database configuration switched to {$type}");
        $this->info('Run "php artisan config:cache" to clear config cache if needed.');
        
        return Command::SUCCESS;
    }
}
