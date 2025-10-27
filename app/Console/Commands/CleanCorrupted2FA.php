<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Limpia configuraciones de 2FA corruptas causadas por cambios en APP_KEY
 */
class CleanCorrupted2FA extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:clean-corrupted-2fa 
                            {--user= : ID del usuario específico a limpiar}
                            {--dry-run : Mostrar qué se haría sin hacer cambios}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia configuraciones de 2FA corruptas causadas por cambios en APP_KEY';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 Modo DRY RUN - No se harán cambios reales');
        }

        $query = User::whereNotNull('two_factor_secret');

        if ($userId) {
            $query->where('id', $userId);
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            $this->info('✅ No se encontraron usuarios con 2FA habilitado');
            return 0;
        }

        $this->info("🔍 Verificando {$users->count()} usuario(s) con 2FA habilitado...");

        $corruptedCount = 0;
        $cleanCount = 0;

        foreach ($users as $user) {
            try {
                // Intentar descifrar el secret
                $user->twoFactorQrCodeUrl();
                $cleanCount++;
                $this->line("✅ Usuario #{$user->id} ({$user->email}): 2FA OK");
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                $corruptedCount++;
                $this->error("❌ Usuario #{$user->id} ({$user->email}): 2FA CORRUPTO");

                if (!$dryRun) {
                    $user->forceFill([
                        'two_factor_secret' => null,
                        'two_factor_recovery_codes' => null,
                        'two_factor_confirmed_at' => null,
                    ])->save();

                    Log::warning('2FA corrupto limpiado para usuario', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'command' => 'auth:clean-corrupted-2fa'
                    ]);

                    $this->info("   🧹 2FA limpiado para usuario #{$user->id}");
                } else {
                    $this->warn("   🔍 [DRY RUN] Se limpiaría 2FA para usuario #{$user->id}");
                }
            }
        }

        $this->newLine();
        $this->info('📊 Resumen:');
        $this->line("   ✅ Usuarios con 2FA OK: {$cleanCount}");
        $this->line("   ❌ Usuarios con 2FA corrupto: {$corruptedCount}");

        if ($dryRun && $corruptedCount > 0) {
            $this->newLine();
            $this->warn('💡 Para limpiar los usuarios corruptos, ejecuta el comando sin --dry-run:');
            $this->line('   php artisan auth:clean-corrupted-2fa');
        }

        if (!$dryRun && $corruptedCount > 0) {
            $this->newLine();
            $this->info('✅ Se limpiaron las configuraciones de 2FA corruptas');
            $this->warn('⚠️  Los usuarios afectados deberán habilitar 2FA nuevamente');
        }

        return 0;
    }
}

