<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use App\Models\BanAppeal;
use App\Services\BanAppealService;

class VerifyBanAppealSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ban-appeal:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify that the ban appeal system is correctly configured and operational';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando Sistema de Apelación de Baneos...');
        $this->newLine();

        $checks = [
            'checkDatabase',
            'checkStorage',
            'checkConfig',
            'checkRoutes',
            'checkMiddleware',
            'checkNotifications',
            'checkServices',
            'checkViews',
        ];

        $passed = 0;
        $failed = 0;

        foreach ($checks as $check) {
            if ($this->$check()) {
                $passed++;
            } else {
                $failed++;
            }
        }

        $this->newLine();
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info("✅ Verificaciones Pasadas: {$passed}");
        if ($failed > 0) {
            $this->error("❌ Verificaciones Fallidas: {$failed}");
        }
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return $failed === 0 ? Command::SUCCESS : Command::FAILURE;
    }

    protected function checkDatabase(): bool
    {
        $this->info('📊 Verificando Base de Datos...');

        try {
            // Check if table exists
            if (!Schema::hasTable('ban_appeals')) {
                $this->error('   ❌ Tabla ban_appeals no existe');
                $this->warn('   💡 Ejecuta: php artisan migrate');
                return false;
            }

            // Check required columns
            $requiredColumns = [
                'id', 'user_id', 'user_ban_id', 'reason', 'evidence_path',
                'status', 'admin_response', 'reviewed_by', 'reviewed_at',
                'appeal_token', 'ip_address', 'user_agent', 'created_at', 'updated_at'
            ];

            foreach ($requiredColumns as $column) {
                if (!Schema::hasColumn('ban_appeals', $column)) {
                    $this->error("   ❌ Columna {$column} no existe");
                    return false;
                }
            }

            // Check indexes
            $indexes = DB::select("SHOW INDEX FROM ban_appeals WHERE Key_name != 'PRIMARY'");
            $indexNames = array_column($indexes, 'Key_name');

            if (!in_array('ban_appeals_user_id_index', $indexNames)) {
                $this->warn('   ⚠️  Índice user_id no encontrado');
            }

            if (!in_array('ban_appeals_user_ban_id_unique', $indexNames)) {
                $this->warn('   ⚠️  Constraint único user_ban_id no encontrado');
            }

            $this->info('   ✅ Base de datos configurada correctamente');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkStorage(): bool
    {
        $this->info('💾 Verificando Storage...');

        try {
            // Check if storage link exists
            if (!file_exists(public_path('storage'))) {
                $this->error('   ❌ Enlace simbólico de storage no existe');
                $this->warn('   💡 Ejecuta: php artisan storage:link');
                return false;
            }

            // Check if ban-appeals directory exists
            $disk = Storage::disk('public');
            if (!$disk->exists('ban-appeals')) {
                $this->warn('   ⚠️  Directorio ban-appeals no existe, se creará automáticamente');
            }

            // Check write permissions
            $testFile = 'ban-appeals/.test';
            try {
                $disk->put($testFile, 'test');
                $disk->delete($testFile);
                $this->info('   ✅ Permisos de escritura correctos');
            } catch (\Exception $e) {
                $this->error('   ❌ No hay permisos de escritura en storage/app/public/ban-appeals');
                $this->warn('   💡 Ejecuta: chmod -R 775 storage/app/public/ban-appeals');
                return false;
            }

            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkConfig(): bool
    {
        $this->info('⚙️  Verificando Configuración...');

        try {
            $config = config('ban_appeals');

            if (!$config) {
                $this->error('   ❌ Archivo config/ban_appeals.php no encontrado');
                return false;
            }

            // Check required config keys
            $requiredKeys = [
                'limits', 'reason', 'evidence', 'admin_response',
                'notifications', 'security', 'spam_patterns', 'logging'
            ];

            foreach ($requiredKeys as $key) {
                if (!isset($config[$key])) {
                    $this->error("   ❌ Configuración {$key} no encontrada");
                    return false;
                }
            }

            $this->info('   ✅ Configuración correcta');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkRoutes(): bool
    {
        $this->info('🛣️  Verificando Rutas...');

        try {
            $routes = [
                'ban-appeal.create',
                'ban-appeal.store',
                'ban-appeal.status',
                'admin.ban-appeals.index',
                'admin.ban-appeals.show',
                'admin.ban-appeals.approve',
                'admin.ban-appeals.reject',
                'admin.ban-appeals.request-info',
            ];

            foreach ($routes as $route) {
                if (!app('router')->has($route)) {
                    $this->error("   ❌ Ruta {$route} no encontrada");
                    return false;
                }
            }

            $this->info('   ✅ Todas las rutas registradas');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkMiddleware(): bool
    {
        $this->info('🛡️  Verificando Middleware...');

        try {
            $middlewareClasses = [
                \App\Http\Middleware\ValidateBanAppealAccess::class,
                \App\Http\Middleware\EnsureUserNotBanned::class,
            ];

            foreach ($middlewareClasses as $class) {
                if (!class_exists($class)) {
                    $this->error("   ❌ Middleware {$class} no encontrado");
                    return false;
                }
            }

            $this->info('   ✅ Middleware configurado correctamente');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkNotifications(): bool
    {
        $this->info('📧 Verificando Notificaciones...');

        try {
            $notificationClasses = [
                \App\Notifications\BanAppealSubmitted::class,
                \App\Notifications\BanAppealReviewed::class,
            ];

            foreach ($notificationClasses as $class) {
                if (!class_exists($class)) {
                    $this->error("   ❌ Notificación {$class} no encontrada");
                    return false;
                }
            }

            // Check mail configuration
            if (!config('mail.from.address')) {
                $this->warn('   ⚠️  MAIL_FROM_ADDRESS no configurado en .env');
            }

            $this->info('   ✅ Notificaciones configuradas');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkServices(): bool
    {
        $this->info('🔧 Verificando Servicios...');

        try {
            $service = app(BanAppealService::class);

            if (!$service) {
                $this->error('   ❌ BanAppealService no se puede resolver');
                return false;
            }

            // Check if service methods exist
            $requiredMethods = [
                'canUserAppeal',
                'submitAppeal',
                'reviewAppeal',
                'getAppealByToken',
            ];

            foreach ($requiredMethods as $method) {
                if (!method_exists($service, $method)) {
                    $this->error("   ❌ Método {$method} no encontrado en BanAppealService");
                    return false;
                }
            }

            $this->info('   ✅ Servicios funcionando correctamente');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }

    protected function checkViews(): bool
    {
        $this->info('🎨 Verificando Vistas...');

        try {
            $views = [
                'resources/js/Pages/BanAppeal/Create.jsx',
                'resources/js/Pages/BanAppeal/Status.jsx',
                'resources/js/Pages/Admin/BanAppeals/Index.jsx',
                'resources/js/Pages/Admin/BanAppeals/Show.jsx',
            ];

            foreach ($views as $view) {
                if (!file_exists(base_path($view))) {
                    $this->error("   ❌ Vista {$view} no encontrada");
                    return false;
                }
            }

            $this->info('   ✅ Todas las vistas existen');
            return true;
        } catch (\Exception $e) {
            $this->error('   ❌ Error: ' . $e->getMessage());
            return false;
        }
    }
}

