<?php

namespace App\Console\Commands;

use App\Helpers\VersionHelper;
use Illuminate\Console\Command;

class VersionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:version
                            {action? : Action to perform (show, bump, set, history)}
                            {--type= : Version component to bump (major, minor, patch)}
                            {--ver= : Specific version to set}
                            {--prerelease= : Prerelease identifier (alpha, beta, rc.1)}
                            {--build= : Build metadata}
                            {--json : Output as JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage application version (Semantic Versioning)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = $this->argument('action') ?? 'show';

        return match ($action) {
            'show' => $this->showVersion(),
            'bump' => $this->bumpVersion(),
            'set' => $this->setVersion(),
            'history' => $this->showHistory(),
            default => $this->error("Unknown action: {$action}") ?? 1,
        };
    }

    /**
     * Show current version information.
     */
    protected function showVersion(): int
    {
        if ($this->option('json')) {
            $this->line(json_encode(VersionHelper::toArray(), JSON_PRETTY_PRINT));
            return 0;
        }

        $this->info('MDR Construcciones - Version Information');
        $this->newLine();

        $this->table(
            ['Property', 'Value'],
            [
                ['Full Version', VersionHelper::full()],
                ['Short Version', VersionHelper::short()],
                ['Major', VersionHelper::major()],
                ['Minor', VersionHelper::minor()],
                ['Patch', VersionHelper::patch()],
                ['Prerelease', VersionHelper::prerelease() ?? 'N/A'],
                ['Build', VersionHelper::build() ?? 'N/A'],
                ['Is Prerelease', VersionHelper::isPrerelease() ? 'Yes' : 'No'],
                ['Is Stable', VersionHelper::isStable() ? 'Yes' : 'No'],
                ['Release Date', VersionHelper::releaseDate()],
                ['Release Name', VersionHelper::releaseName()],
            ]
        );

        return 0;
    }

    /**
     * Bump version component.
     */
    protected function bumpVersion(): int
    {
        $type = $this->option('type');

        if (!$type) {
            $type = $this->choice(
                'Which version component to bump?',
                ['major', 'minor', 'patch'],
                2 // Default to patch
            );
        }

        if (!in_array($type, ['major', 'minor', 'patch'])) {
            $this->error("Invalid type: {$type}. Must be major, minor, or patch.");
            return 1;
        }

        $current = [
            'major' => VersionHelper::major(),
            'minor' => VersionHelper::minor(),
            'patch' => VersionHelper::patch(),
        ];

        $new = $current;

        switch ($type) {
            case 'major':
                $new['major']++;
                $new['minor'] = 0;
                $new['patch'] = 0;
                break;
            case 'minor':
                $new['minor']++;
                $new['patch'] = 0;
                break;
            case 'patch':
                $new['patch']++;
                break;
        }

        $prerelease = $this->option('prerelease') ?? VersionHelper::prerelease();
        $build = $this->option('build') ?? VersionHelper::build();

        $newVersion = "{$new['major']}.{$new['minor']}.{$new['patch']}";
        if ($prerelease) {
            $newVersion .= "-{$prerelease}";
        }
        if ($build) {
            $newVersion .= "+{$build}";
        }

        $this->info("Current version: " . VersionHelper::full());
        $this->info("New version: {$newVersion}");
        $this->newLine();

        if (!$this->confirm('Do you want to update the version?', true)) {
            $this->warn('Version update cancelled.');
            return 0;
        }

        $this->updateVersionFiles($newVersion, $new, $prerelease, $build);

        $this->info('✅ Version updated successfully!');
        $this->newLine();
        $this->warn('Don\'t forget to:');
        $this->line('1. Update CHANGELOG.md');
        $this->line('2. Commit changes: git add . && git commit -m "chore: bump version to ' . $newVersion . '"');
        $this->line('3. Create tag: git tag -a v' . $newVersion . ' -m "Release version ' . $newVersion . '"');
        $this->line('4. Push: git push origin main && git push origin v' . $newVersion);

        return 0;
    }

    /**
     * Set specific version.
     */
    protected function setVersion(): int
    {
        $version = $this->option('ver');

        if (!$version) {
            $version = $this->ask('Enter the new version (e.g., 1.0.0-beta)');
        }

        if (!$version) {
            $this->error('Version is required.');
            return 1;
        }

        // Parse version
        if (!preg_match('/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/', $version, $matches)) {
            $this->error('Invalid version format. Use: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]');
            return 1;
        }

        $components = [
            'major' => (int) $matches[1],
            'minor' => (int) $matches[2],
            'patch' => (int) $matches[3],
        ];
        $prerelease = $matches[4] ?? null;
        $build = $matches[5] ?? null;

        $this->info("Current version: " . VersionHelper::full());
        $this->info("New version: {$version}");
        $this->newLine();

        if (!$this->confirm('Do you want to update the version?', true)) {
            $this->warn('Version update cancelled.');
            return 0;
        }

        $this->updateVersionFiles($version, $components, $prerelease, $build);

        $this->info('✅ Version updated successfully!');

        return 0;
    }

    /**
     * Show version history.
     */
    protected function showHistory(): int
    {
        $this->info('Version History');
        $this->newLine();

        $history = VersionHelper::history();

        foreach ($history as $version => $info) {
            $this->line("<fg=cyan>## [{$version}]</> - {$info['date']}");
            $this->line("<fg=yellow>{$info['name']}</>");
            $this->newLine();

            if (!empty($info['highlights'])) {
                foreach ($info['highlights'] as $highlight) {
                    $this->line("  • {$highlight}");
                }
                $this->newLine();
            }
        }

        return 0;
    }

    /**
     * Update version in all files.
     */
    protected function updateVersionFiles(string $version, array $components, ?string $prerelease, ?string $build): void
    {
        // Update VERSION file
        file_put_contents(base_path('VERSION'), $version);

        // Update config/version.php
        $configPath = config_path('version.php');
        $config = file_get_contents($configPath);

        $config = preg_replace(
            "/'version' => env\('APP_VERSION', '[^']+'\),/",
            "'version' => env('APP_VERSION', '{$version}'),",
            $config
        );

        $config = preg_replace("/'major' => \d+,/", "'major' => {$components['major']},", $config);
        $config = preg_replace("/'minor' => \d+,/", "'minor' => {$components['minor']},", $config);
        $config = preg_replace("/'patch' => \d+,/", "'patch' => {$components['patch']},", $config);

        $prereleaseValue = $prerelease ? "'{$prerelease}'" : 'null';
        $config = preg_replace("/'prerelease' => '[^']*'|'prerelease' => null,/", "'prerelease' => {$prereleaseValue},", $config);

        $buildValue = $build ? "'{$build}'" : 'null';
        $config = preg_replace("/'build' => '[^']*'|'build' => null,/", "'build' => {$buildValue},", $config);

        $config = preg_replace("/'release_date' => '[^']*',/", "'release_date' => '" . date('Y-m-d') . "',", $config);

        file_put_contents($configPath, $config);

        // Update composer.json
        $composerPath = base_path('composer.json');
        $composer = json_decode(file_get_contents($composerPath), true);
        $composer['version'] = $version;
        file_put_contents($composerPath, json_encode($composer, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");

        // Update package.json
        $packagePath = base_path('package.json');
        $package = json_decode(file_get_contents($packagePath), true);
        $package['version'] = $version;
        file_put_contents($packagePath, json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");

        $this->info('Updated files:');
        $this->line('  • VERSION');
        $this->line('  • config/version.php');
        $this->line('  • composer.json');
        $this->line('  • package.json');
        $this->newLine();
    }
}

