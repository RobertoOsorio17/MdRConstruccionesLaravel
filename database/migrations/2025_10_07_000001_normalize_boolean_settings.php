<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $booleanSettingIds = [];

        DB::table('admin_settings')
            ->where('type', 'boolean')
            ->chunkById(100, function ($settings) use (&$booleanSettingIds) {
                foreach ($settings as $setting) {
                    $normalized = filter_var(
                        strtolower((string) $setting->value),
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE
                    );

                    $booleanSettingIds[] = $setting->id;

                    $target = ($normalized ?? false) ? '1' : '0';

                    if ($setting->value !== $target) {
                        DB::table('admin_settings')
                            ->where('id', $setting->id)
                            ->update(['value' => $target]);
                    }
                }
            });

        $booleanSettingIds = array_unique($booleanSettingIds);

        if (empty($booleanSettingIds)) {
            return;
        }

        DB::table('admin_setting_history')
            ->whereIn('setting_id', $booleanSettingIds)
            ->chunkById(200, function ($entries) {
                foreach ($entries as $entry) {
                    $old = $this->normalizeHistoryValue($entry->old_value);
                    $new = $this->normalizeHistoryValue($entry->new_value);

                    $updates = [];

                    if (!is_null($old) && $old !== $entry->old_value) {
                        $updates['old_value'] = $old;
                    }

                    if (!is_null($new) && $new !== $entry->new_value) {
                        $updates['new_value'] = $new;
                    }

                    if (!empty($updates)) {
                        DB::table('admin_setting_history')
                            ->where('id', $entry->id)
                            ->update($updates);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback action required.
    }

    /**
     * Normalize boolean-like history values.
     *
     * @param mixed $value
     * @return string|null
     */
    private function normalizeHistoryValue(mixed $value): ?string
    {
        if (is_null($value)) {
            return null;
        }

        $filtered = filter_var(
            strtolower((string) $value),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );

        return ($filtered ?? false) ? '1' : '0';
    }
};
