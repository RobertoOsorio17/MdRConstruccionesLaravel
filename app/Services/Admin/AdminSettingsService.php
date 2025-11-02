<?php

namespace App\Services\Admin;

use App\Events\SettingChanged;
use App\Models\AdminSetting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Coordinates administrative settings updates with validation, auditing events, and cache invalidation.
 * Ensures changes are transactional and only persisted when values actually differ.
 */
class AdminSettingsService
{
    
    
    
    
    /**

    
    
    
     * Handle update settings.

    
    
    
     *

    
    
    
     * @param array $settings The settings.

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function updateSettings(array $settings, ?User $user = null): array
    {
        $errors = [];
        $updatedKeys = [];
        $actor = $user ?? Auth::user();

        // Wrap in transaction to ensure atomicity
        DB::beginTransaction();

        try {
            foreach ($settings as $key => $value) {
            $setting = AdminSetting::where('key', $key)->first();

            if (!$setting) {
                $errors[$key] = 'Setting not found.';
                continue;
            }

            if ($setting->validation_rules) {
                $validator = Validator::make(
                    [$key => $value],
                    [$key => $setting->validation_rules],
                    $this->validationMessages()
                );

                if ($validator->fails()) {
                    $errors[$key] = $validator->errors()->first($key);
                    continue;
                }
            }

            $original = $setting->getRawOriginal('value');
            $setting->value = $value;

            // Only save and fire event if value actually changed
            if ($setting->isDirty('value')) {
                $setting->save();
                $updatedKeys[] = $key;

                event(new SettingChanged(
                    setting: $setting,
                    oldValue: $original,
                    newValue: $setting->getRawOriginal('value'),
                    user: $actor,
                    reason: 'Updated via admin panel'
                ));

                Cache::forget("setting.{$key}");
            }
            }

            Cache::forget('settings.all');

            // Commit transaction if no errors
            if (empty($errors)) {
                DB::commit();
            } else {
                DB::rollBack();
            }

            return [
                'updated' => $updatedKeys,
                'errors' => $errors,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'updated' => [],
                'errors' => ['general' => 'Error al actualizar configuraciones: ' . $e->getMessage()],
            ];
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle validation messages.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function validationMessages(): array
    {
        return [
            'required' => 'Este campo es requerido.',
            'email' => 'El valor debe ser un email valido.',
            'url' => 'El valor debe ser una URL valida.',
            'integer' => 'El valor debe ser un numero entero.',
            'boolean' => 'El valor debe ser verdadero o falso.',
            'max' => 'El valor supera el limite permitido.',
            'min' => 'El valor es menor al minimo permitido.',
        ];
    }
}
