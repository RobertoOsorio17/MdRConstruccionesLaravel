<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Bootstraps the application's MySQL schema by creating the primary database if it does not yet exist.
 * Useful for first-time environment provisioning before running migrations or seeders.
 */
class SetupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup the database for MDR Construcciones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up database for MDR Construcciones...');

        try {
            // Connect to MySQL without selecting a database.
            $connection = config('database.connections.mysql');
            $connection['database'] = null; // Connect without targeting a specific database.
            
            config(['database.connections.temp_mysql' => $connection]);
            
            // Create the database using the temporary connection.
            DB::connection('temp_mysql')->statement('CREATE DATABASE IF NOT EXISTS mdrconstrucciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            $this->info('Database "mdrconstrucciones" created successfully!');
            
            // Verify the default connection afterward.
            DB::connection('mysql')->select('SELECT 1');
            $this->info('MySQL connection verified!');
            
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error('Error creating database: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
