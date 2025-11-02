<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
/**
 * Class Disable2FA.
 */

class Disable2FA extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:disable-2fa {email} {--reason=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable 2FA for a specific user';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        if (! app()->environment(['local', 'development', 'testing'])) {
            $this->error('Este comando está deshabilitado fuera de entornos locales. Utiliza el panel de administración para gestionar 2FA.');
            return 1;
        }

        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("❌ Usuario no encontrado: {$email}");
            return 1;
        }

        $this->info("Usuario encontrado:");
        $this->table(
            ['Campo', 'Valor'],
            [
                ['ID', $user->id],
                ['Nombre', $user->name],
                ['Email', $user->email],
                ['2FA Habilitado', $user->two_factor_secret ? 'Sí' : 'No'],
                ['2FA Confirmado', $user->two_factor_confirmed_at ? $user->two_factor_confirmed_at : 'No'],
            ]
        );

        if (!$user->two_factor_secret) {
            $this->warn("⚠️  El usuario ya tiene 2FA desactivado");
            return 0;
        }

        $reason = $this->option('reason') ?: $this->ask('Indica el motivo de la desactivación de 2FA');

        if (!$reason) {
            $this->error('Se requiere un motivo para desactivar 2FA.');
            return 1;
        }

        if (!$this->confirm('¿Estás seguro de que quieres desactivar 2FA para este usuario?', true)) {
            $this->info('Operación cancelada');
            return 0;
        }

        // Desactivar 2FA
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $user->trustedDevices()->delete();

        $this->info('');
        $this->info('✅ 2FA desactivado exitosamente');
        $this->info('');
        $this->info("El usuario {$email} ahora puede iniciar sesión sin 2FA");
        
        // Log the action
        \Log::info('2FA disabled via CLI', [
            'user_id' => $user->id,
            'email' => $user->email,
            'disabled_by' => 'CLI command',
            'timestamp' => now()->toISOString(),
            'reason' => $reason,
        ]);

        if (class_exists(\App\Models\AdminAuditLog::class)) {
            \App\Models\AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'disable_2fa_cli',
                'description' => '2FA desactivado mediante comando artisan',
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'metadata' => [
                    'reason' => $reason,
                ],
            ]);
        }

        return 0;
    }
}
