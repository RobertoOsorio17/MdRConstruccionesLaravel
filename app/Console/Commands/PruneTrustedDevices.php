<?php

namespace App\Console\Commands;

use App\Models\TrustedDevice;
use Illuminate\Console\Command;

class PruneTrustedDevices extends Command
{
    protected $signature = 'trusted-devices:prune {--days=30 : Remove devices unused for this many days}';

    protected $description = 'Delete expired or stale trusted devices to reduce attack surface.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays(max(1, $days));

        $deleted = TrustedDevice::query()
            ->where(fn ($q) => $q->whereNotNull('expires_at')->where('expires_at', '<', now()))
            ->orWhereNull('expires_at')
                ->where(fn ($q) => $q->whereNull('last_used_at')->orWhere('last_used_at', '<', $cutoff))
            ->delete();

        $this->info("Pruned {$deleted} trusted device records.");

        return self::SUCCESS;
    }
}

