<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDevice;
use App\Services\DeviceTrackingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected DeviceTrackingService $deviceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->deviceService = app(DeviceTrackingService::class);
    }

    /** @test */
    public function device_is_tracked_on_login()
    {
        $this->assertDatabaseCount('user_devices', 0);

        $request = $this->createRequest();
        $this->deviceService->trackDevice($this->user, $request);

        $this->assertDatabaseCount('user_devices', 1);
        $this->assertDatabaseHas('user_devices', [
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function device_information_is_extracted_correctly()
    {
        $request = $this->createRequest();
        
        $device = $this->deviceService->trackDevice($this->user, $request);

        $this->assertNotNull($device->device_id);
        $this->assertNotNull($device->device_type);
        $this->assertNotNull($device->browser);
        $this->assertNotNull($device->platform);
        $this->assertNotNull($device->ip_address);
        $this->assertNotNull($device->last_used_at);
    }

    /** @test */
    public function same_device_updates_last_used_timestamp()
    {
        $request = $this->createRequest();
        
        $device1 = $this->deviceService->trackDevice($this->user, $request);
        $firstTimestamp = $device1->last_used_at;

        sleep(1);

        $device2 = $this->deviceService->trackDevice($this->user, $request);
        $secondTimestamp = $device2->last_used_at;

        $this->assertEquals($device1->id, $device2->id);
        $this->assertNotEquals($firstTimestamp, $secondTimestamp);
        $this->assertDatabaseCount('user_devices', 1);
    }

    /** @test */
    public function user_can_view_their_devices()
    {
        UserDevice::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('devices.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->has('devices', 3)
                ->has('stats')
        );
    }

    /** @test */
    public function user_can_update_device_name()
    {
        $device = UserDevice::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->patch(route('devices.update', $device), [
                'device_name' => 'My iPhone',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('user_devices', [
            'id' => $device->id,
            'device_name' => 'My iPhone',
        ]);
    }

    /** @test */
    public function user_can_trust_device()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'is_trusted' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('devices.trust', $device));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $device->refresh();
        $this->assertTrue($device->is_trusted);
        $this->assertNotNull($device->verified_at);
    }

    /** @test */
    public function user_can_untrust_device()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'is_trusted' => true,
            'verified_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('devices.untrust', $device));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $device->refresh();
        $this->assertFalse($device->is_trusted);
        $this->assertNull($device->verified_at);
    }

    /** @test */
    public function user_can_remove_device()
    {
        $device = UserDevice::factory()->create(['user_id' => $this->user->id]);

        // Create another device to simulate current device
        $currentDevice = UserDevice::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('devices.destroy', $device));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('user_devices', ['id' => $device->id]);
    }

    /** @test */
    public function user_cannot_remove_other_users_device()
    {
        $otherUser = User::factory()->create();
        $device = UserDevice::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('devices.destroy', $device));

        $response->assertForbidden();
        $this->assertDatabaseHas('user_devices', ['id' => $device->id]);
    }

    /** @test */
    public function user_can_remove_inactive_devices()
    {
        // Create active device (used recently)
        UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(10),
        ]);

        // Create inactive devices (not used in 90+ days)
        UserDevice::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(100),
            'is_trusted' => false,
        ]);

        // Create trusted inactive device (should not be removed)
        UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(100),
            'is_trusted' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('devices.remove-inactive'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Should have 2 devices left (1 active + 1 trusted)
        $this->assertDatabaseCount('user_devices', 2);
    }

    /** @test */
    public function device_display_name_is_generated_correctly()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_name' => null,
            'browser' => 'Chrome',
            'platform' => 'Windows',
            'city' => 'New York',
        ]);

        $this->assertEquals('Chrome - Windows - New York', $device->display_name);
    }

    /** @test */
    public function device_display_name_uses_custom_name_if_set()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_name' => 'My Work Laptop',
            'browser' => 'Chrome',
            'platform' => 'Windows',
        ]);

        $this->assertEquals('My Work Laptop', $device->display_name);
    }

    /** @test */
    public function device_is_active_if_used_recently()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(10),
        ]);

        $this->assertTrue($device->isActive());
    }

    /** @test */
    public function device_is_not_active_if_not_used_recently()
    {
        $device = UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(40),
        ]);

        $this->assertFalse($device->isActive());
    }

    /** @test */
    public function service_can_detect_new_device()
    {
        $request = $this->createRequest();

        $this->assertTrue($this->deviceService->isNewDevice($this->user, $request));

        $this->deviceService->trackDevice($this->user, $request);

        $this->assertFalse($this->deviceService->isNewDevice($this->user, $request));
    }

    /** @test */
    public function service_can_get_device_counts()
    {
        // Create 2 active devices
        UserDevice::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(10),
            'is_trusted' => false,
        ]);

        // Create 1 inactive device
        UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(40),
            'is_trusted' => false,
        ]);

        // Create 1 trusted device (also active)
        UserDevice::factory()->create([
            'user_id' => $this->user->id,
            'last_used_at' => now()->subDays(5),
            'is_trusted' => true,
        ]);

        // Should have 3 active devices (2 + 1 trusted)
        $this->assertEquals(3, $this->deviceService->getActiveDevicesCount($this->user));
        $this->assertEquals(1, $this->deviceService->getTrustedDevicesCount($this->user));
    }

    protected function createRequest()
    {
        return request()->create('/', 'GET', [], [], [], [
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'REMOTE_ADDR' => '127.0.0.1',
        ]);
    }
}

