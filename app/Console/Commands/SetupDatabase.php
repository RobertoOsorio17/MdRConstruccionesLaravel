<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Exception;

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
            // Conectar a MySQL sin especificar base de datos
            $connection = config('database.connections.mysql');
            $connection['database'] = null; // Conectar sin DB específica
            
            config(['database.connections.temp_mysql' => $connection]);
            
            // Crear la base de datos usando la conexión temporal
            DB::connection('temp_mysql')->statement('CREATE DATABASE IF NOT EXISTS mdrconstrucciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            $this->info('Database "mdrconstrucciones" created successfully!');
            
            // Ahora verificar la conexión normal
            DB::connection('mysql')->select('SELECT 1');
            $this->info('MySQL connection verified!');
            
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error('Error creating database: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}