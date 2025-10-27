<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Laravel\Fortify\TwoFactorAuthenticationProvider;
use PragmaRX\Google2FA\Google2FA;

class Generate2FACode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:2fa-code {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate current valid 2FA code for a user and test verification';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (! app()->environment(['local', 'development', 'testing'])) {
            $this->error('This diagnostic command is disabled outside of local environments.');
            return 1;
        }

        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        if (!$user->two_factor_secret) {
            $this->error("User {$email} does not have 2FA enabled.");
            return 1;
        }

        try {
            $this->info(str_repeat('═', 63));
            $this->info('  2FA INTEGRITY DIAGNOSTIC');
            $this->info(str_repeat('═', 63));
            $this->newLine();

            $this->line("User: {$user->email} (ID: {$user->id})");
            $this->line('Confirmed: ' . ($user->two_factor_confirmed_at ? '✅ yes' : '⚠️ pending'));
            $this->newLine();

            $secret = decrypt($user->two_factor_secret);
            $google2fa = new Google2FA();
            $currentOtp = $google2fa->getCurrentOtp($secret);
            $provider = app(TwoFactorAuthenticationProvider::class);
            $valid = $provider->verify($secret, $currentOtp);

            $this->table(
                ['Verification', 'Status'],
                [
                    ['Secret decryptable', '✅'],
                    ['Fortify verification', $valid ? '✅ passes' : '❌ fails'],
                ]
            );

            $this->newLine();
            $this->line('Window tolerance test:');

            for ($window = 0; $window <= 3; $window++) {
                $windowValid = $google2fa->verifyKey($secret, $currentOtp, $window);
                $seconds = $window * 30;
                $this->line(sprintf(
                    '  ±%02d seconds: %s',
                    $seconds,
                    $windowValid ? 'OK' : 'FAIL'
                ));
            }

            $this->newLine();
            $features = config('fortify.features');
            $twoFactorConfig = null;
            foreach ($features as $feature) {
                if (is_array($feature) && isset($feature['window'])) {
                    $twoFactorConfig = $feature;
                    break;
                }
            }
            
            if ($twoFactorConfig) {
                $window = $twoFactorConfig['window'] ?? 0;
                $seconds = $window * 30;
                $this->info("Configured Fortify window: {$window} (±{$seconds}s).");
            } else {
                $this->warn('⚠️  Fortify 2FA configuration not found.');
            }
            $this->newLine();

            return $valid ? 0 : 1;
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            $this->error("❌ Failed to decrypt 2FA secret!");
            $this->error("Error: " . $e->getMessage());
            $this->newLine();
            $this->warn("This usually means the APP_KEY has changed since 2FA was enabled.");
            $this->warn("The user needs to disable and re-enable 2FA.");
            $this->newLine();
            $this->info("To fix this, run:");
            $this->line("  php artisan user:disable-2fa {$email}");
            $this->line("  Then re-enable 2FA from the user profile");
            return 1;
        } catch (\Exception $e) {
            $this->error("❌ Unexpected error: " . $e->getMessage());
            $this->error("Trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}
