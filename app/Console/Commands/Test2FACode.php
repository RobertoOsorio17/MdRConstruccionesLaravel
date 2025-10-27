<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Laravel\Fortify\TwoFactorAuthenticationProvider;

class Test2FACode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:2fa {email} {code}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test a 2FA code for a user';

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
        $code = $this->argument('code');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User not found: {$email}");
            return 1;
        }

        if (!$user->two_factor_secret) {
            $this->error("User does not have 2FA enabled");
            return 1;
        }

        if (!$user->two_factor_confirmed_at) {
            $this->error("User has not confirmed 2FA");
            return 1;
        }

        $this->info("Testing 2FA for user: {$user->email}");
        $this->info("User ID: {$user->id}");
        $this->info("2FA Confirmed At: {$user->two_factor_confirmed_at}");
        $this->info("Server time: " . now()->toISOString());
        $this->info("Server timestamp: " . now()->timestamp);

        try {
            $provider = app(TwoFactorAuthenticationProvider::class);
            $secret = decrypt($user->two_factor_secret);
            
            $this->info("Secret decrypted successfully");

            $valid = $provider->verify($secret, $code);

            if ($valid) {
                $this->info("✅ Code is VALID");
                return 0;
            } else {
                $this->error("❌ Code is INVALID");
                return 1;
            }
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("Trace: " . $e->getTraceAsString());
            return 1;
        }
    }

}
