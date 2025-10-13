<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserDevice>
 */
class UserDeviceFactory extends Factory
{
    protected $model = UserDevice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
        $platforms = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
        $deviceTypes = ['desktop', 'mobile', 'tablet'];
        $cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Local'];
        $countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Local'];

        $browser = fake()->randomElement($browsers);
        $platform = fake()->randomElement($platforms);

        return [
            'user_id' => User::factory(),
            'device_id' => Hash::make(fake()->uuid()),
            'device_name' => null,
            'device_type' => fake()->randomElement($deviceTypes),
            'browser' => $browser,
            'browser_version' => fake()->numerify('##.#.####.###'),
            'platform' => $platform,
            'platform_version' => fake()->numerify('##.#'),
            'ip_address' => fake()->ipv4(),
            'country' => fake()->randomElement($countries),
            'city' => fake()->randomElement($cities),
            'is_trusted' => false,
            'last_used_at' => now(),
            'verified_at' => null,
        ];
    }

    /**
     * Indicate that the device is trusted.
     */
    public function trusted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_trusted' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Indicate that the device is active (used recently).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_used_at' => now()->subDays(fake()->numberBetween(1, 29)),
        ]);
    }

    /**
     * Indicate that the device is inactive (not used recently).
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_used_at' => now()->subDays(fake()->numberBetween(31, 180)),
        ]);
    }

    /**
     * Indicate that the device is a mobile device.
     */
    public function mobile(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => 'mobile',
            'platform' => fake()->randomElement(['iOS', 'Android']),
            'browser' => fake()->randomElement(['Safari', 'Chrome']),
        ]);
    }

    /**
     * Indicate that the device is a desktop device.
     */
    public function desktop(): static
    {
        return $this->state(fn (array $attributes) => [
            'device_type' => 'desktop',
            'platform' => fake()->randomElement(['Windows', 'macOS', 'Linux']),
            'browser' => fake()->randomElement(['Chrome', 'Firefox', 'Edge', 'Safari']),
        ]);
    }
}

