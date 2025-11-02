# Ejemplos de Uso - Sistema de Apelación de Baneos

## 📚 Tabla de Contenidos

1. [Uso del Servicio](#uso-del-servicio)
2. [Ejemplos de Controlador](#ejemplos-de-controlador)
3. [Ejemplos de Vistas](#ejemplos-de-vistas)
4. [Ejemplos de Testing](#ejemplos-de-testing)
5. [Ejemplos de Personalización](#ejemplos-de-personalización)

---

## 🔧 Uso del Servicio

### Verificar si un Usuario Puede Apelar

```php
use App\Services\BanAppealService;

$banAppealService = app(BanAppealService::class);
$user = auth()->user();

$canAppeal = $banAppealService->canUserAppeal($user);

if ($canAppeal['can_appeal']) {
    // Usuario puede apelar
    echo "Puedes apelar tu baneo";
} else {
    // Usuario no puede apelar
    echo "Razón: " . $canAppeal['reason'];
    
    // Si tiene una apelación existente
    if (isset($canAppeal['appeal'])) {
        $appeal = $canAppeal['appeal'];
        echo "Estado de tu apelación: " . $appeal->status;
    }
}
```

### Enviar una Apelación

```php
use App\Services\BanAppealService;
use Illuminate\Http\UploadedFile;

$banAppealService = app(BanAppealService::class);
$user = auth()->user();

$data = [
    'reason' => 'Creo que el baneo fue injusto porque...',
    'evidence' => $request->file('evidence'), // UploadedFile o null
    'terms_accepted' => true,
];

try {
    $appeal = $banAppealService->submitAppeal($user, $data);
    
    echo "Apelación enviada exitosamente";
    echo "Token: " . $appeal->appeal_token;
    echo "URL de seguimiento: " . route('ban-appeal.status', $appeal->appeal_token);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Revisar una Apelación (Admin)

```php
use App\Services\BanAppealService;
use App\Models\BanAppeal;

$banAppealService = app(BanAppealService::class);
$admin = auth()->user();
$appeal = BanAppeal::findOrFail($id);

// Aprobar
try {
    $banAppealService->reviewAppeal(
        $appeal,
        $admin,
        'approve',
        'Tu apelación ha sido aprobada. Bienvenido de vuelta.'
    );
    
    echo "Apelación aprobada. Usuario desbaneado.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}

// Rechazar
try {
    $banAppealService->reviewAppeal(
        $appeal,
        $admin,
        'reject',
        'Tu apelación ha sido rechazada porque...'
    );
    
    echo "Apelación rechazada. Baneo se mantiene.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}

// Solicitar más información
try {
    $banAppealService->reviewAppeal(
        $appeal,
        $admin,
        'request_info',
        'Necesitamos más información sobre...'
    );
    
    echo "Información adicional solicitada.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Obtener Apelación por Token

```php
use App\Services\BanAppealService;

$banAppealService = app(BanAppealService::class);
$token = $request->route('token');

try {
    $appeal = $banAppealService->getAppealByToken($token);
    
    echo "Apelación encontrada";
    echo "Estado: " . $appeal->status;
    echo "Usuario: " . $appeal->user->name;
} catch (\Exception $e) {
    echo "Token inválido o apelación no encontrada";
}
```

---

## 🎮 Ejemplos de Controlador

### Controlador Personalizado

```php
namespace App\Http\Controllers;

use App\Services\BanAppealService;
use App\Models\BanAppeal;
use Illuminate\Http\Request;

class CustomBanAppealController extends Controller
{
    protected $banAppealService;

    public function __construct(BanAppealService $banAppealService)
    {
        $this->middleware('auth');
        $this->banAppealService = $banAppealService;
    }

    /**
     * Obtener estadísticas de apelaciones del usuario
     */
    public function myAppeals()
    {
        $user = auth()->user();
        
        $appeals = BanAppeal::where('user_id', $user->id)
            ->with(['userBan', 'reviewedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        $statistics = [
            'total' => $appeals->count(),
            'pending' => $appeals->where('status', 'pending')->count(),
            'approved' => $appeals->where('status', 'approved')->count(),
            'rejected' => $appeals->where('status', 'rejected')->count(),
        ];

        return view('my-appeals', compact('appeals', 'statistics'));
    }

    /**
     * Cancelar una apelación pendiente
     */
    public function cancel(BanAppeal $appeal)
    {
        $user = auth()->user();

        // Verificar que la apelación pertenece al usuario
        if ($appeal->user_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Solo se pueden cancelar apelaciones pendientes
        if ($appeal->status !== 'pending') {
            return back()->with('error', 'Solo puedes cancelar apelaciones pendientes');
        }

        $appeal->delete();

        return redirect()->route('home')
            ->with('success', 'Apelación cancelada exitosamente');
    }
}
```

---

## 🎨 Ejemplos de Vistas

### Blade: Mostrar Botón de Apelación

```blade
@php
    $canAppeal = app(\App\Services\BanAppealService::class)->canUserAppeal(auth()->user());
@endphp

@if($canAppeal['can_appeal'])
    <div class="alert alert-warning">
        <h4>Tu cuenta está baneada</h4>
        <p>Razón: {{ auth()->user()->activeBan()->reason }}</p>
        <a href="{{ route('ban-appeal.create') }}" class="btn btn-primary">
            Apelar Baneo
        </a>
    </div>
@elseif(isset($canAppeal['appeal']))
    <div class="alert alert-info">
        <h4>Apelación en Proceso</h4>
        <p>Estado: {{ $canAppeal['appeal']->status_label }}</p>
        <a href="{{ route('ban-appeal.status', $canAppeal['appeal']->appeal_token) }}" class="btn btn-info">
            Ver Estado
        </a>
    </div>
@endif
```

### React: Componente de Estado de Apelación

```jsx
import React from 'react';
import { Chip, Alert } from '@mui/material';

const AppealStatusBadge = ({ status }) => {
    const getConfig = () => {
        switch (status) {
            case 'pending':
                return { color: 'warning', label: 'Pendiente' };
            case 'approved':
                return { color: 'success', label: 'Aprobada' };
            case 'rejected':
                return { color: 'error', label: 'Rechazada' };
            case 'more_info_requested':
                return { color: 'info', label: 'Info Requerida' };
            default:
                return { color: 'default', label: status };
        }
    };

    const config = getConfig();

    return <Chip label={config.label} color={config.color} />;
};

export default AppealStatusBadge;
```

---

## 🧪 Ejemplos de Testing

### Test Unitario: BanAppealService

```php
namespace Tests\Unit;

use Tests\TestCase;
use App\Services\BanAppealService;
use App\Models\User;
use App\Models\UserBan;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BanAppealServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $banAppealService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->banAppealService = app(BanAppealService::class);
    }

    /** @test */
    public function user_can_appeal_when_banned_and_no_existing_appeal()
    {
        $user = User::factory()->create();
        $ban = UserBan::factory()->create(['user_id' => $user->id]);

        $result = $this->banAppealService->canUserAppeal($user);

        $this->assertTrue($result['can_appeal']);
    }

    /** @test */
    public function user_cannot_appeal_when_not_banned()
    {
        $user = User::factory()->create();

        $result = $this->banAppealService->canUserAppeal($user);

        $this->assertFalse($result['can_appeal']);
        $this->assertEquals('No tienes un baneo activo', $result['reason']);
    }

    /** @test */
    public function user_cannot_appeal_twice_for_same_ban()
    {
        $user = User::factory()->create();
        $ban = UserBan::factory()->create(['user_id' => $user->id]);
        
        // Primera apelación
        $this->banAppealService->submitAppeal($user, [
            'reason' => 'Test reason that is long enough to pass validation',
            'evidence' => null,
            'terms_accepted' => true,
        ]);

        // Intentar segunda apelación
        $result = $this->banAppealService->canUserAppeal($user);

        $this->assertFalse($result['can_appeal']);
        $this->assertStringContainsString('Ya has enviado una apelación', $result['reason']);
    }
}
```

### Test de Feature: Envío de Apelación

```php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\UserBan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class BanAppealSubmissionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function banned_user_can_submit_appeal()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $ban = UserBan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('ban-appeal.store'), [
            'reason' => 'This is a valid reason that is long enough to pass the minimum length validation requirement',
            'evidence' => UploadedFile::fake()->image('evidence.jpg'),
            'terms_accepted' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('ban_appeals', [
            'user_id' => $user->id,
            'user_ban_id' => $ban->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function appeal_requires_minimum_reason_length()
    {
        $user = User::factory()->create();
        UserBan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('ban-appeal.store'), [
            'reason' => 'Too short',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors('reason');
    }

    /** @test */
    public function appeal_requires_terms_acceptance()
    {
        $user = User::factory()->create();
        UserBan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('ban-appeal.store'), [
            'reason' => 'This is a valid reason that is long enough to pass validation',
            'terms_accepted' => false,
        ]);

        $response->assertSessionHasErrors('terms_accepted');
    }
}
```

---

## 🎨 Ejemplos de Personalización

### Personalizar Validación de Spam

```php
// En config/ban_appeals.php
'spam_patterns' => [
    'keywords' => [
        'viagra',
        'casino',
        'lottery',
        // Añade tus propias palabras
        'palabra_spam_1',
        'palabra_spam_2',
    ],
    'max_urls' => 3,
    'max_char_repetition' => 20,
],
```

### Personalizar Notificaciones

```php
// En app/Notifications/BanAppealSubmitted.php

public function toMail($notifiable)
{
    return (new MailMessage)
        ->subject('Nueva Apelación de Baneo - ' . config('app.name'))
        ->greeting('¡Hola Administrador!')
        ->line('Se ha recibido una nueva apelación de baneo.')
        ->line('**Usuario:** ' . $this->appeal->user->name)
        ->line('**Email:** ' . $this->appeal->user->email)
        ->line('**Razón:** ' . Str::limit($this->appeal->reason, 100))
        ->action('Revisar Apelación', route('admin.ban-appeals.show', $this->appeal->id))
        ->line('Por favor, revisa la apelación lo antes posible.')
        // Personaliza aquí
        ->line('Tiempo de respuesta esperado: 24-48 horas')
        ->salutation('Saludos, ' . config('app.name'));
}
```

### Añadir Campos Personalizados

```php
// 1. Crear migración
php artisan make:migration add_custom_fields_to_ban_appeals_table

// 2. En la migración
public function up()
{
    Schema::table('ban_appeals', function (Blueprint $table) {
        $table->string('appeal_category')->nullable();
        $table->text('additional_context')->nullable();
    });
}

// 3. Actualizar modelo
protected $fillable = [
    // ... campos existentes
    'appeal_category',
    'additional_context',
];

// 4. Actualizar Form Request
public function rules()
{
    return [
        // ... reglas existentes
        'appeal_category' => 'nullable|string|in:technical,misunderstanding,false_positive',
        'additional_context' => 'nullable|string|max:500',
    ];
}
```

### Webhook al Aprobar/Rechazar

```php
// En app/Services/BanAppealService.php

protected function notifyWebhook(BanAppeal $appeal, string $action)
{
    $webhookUrl = config('ban_appeals.webhook_url');
    
    if (!$webhookUrl) {
        return;
    }

    Http::post($webhookUrl, [
        'event' => 'ban_appeal.' . $action,
        'appeal_id' => $appeal->id,
        'user_id' => $appeal->user_id,
        'status' => $appeal->status,
        'timestamp' => now()->toIso8601String(),
    ]);
}

// Llamar en reviewAppeal()
$this->notifyWebhook($appeal, $action);
```

---

## 📊 Consultas Útiles

### Obtener Estadísticas Globales

```php
use App\Models\BanAppeal;

$stats = [
    'total' => BanAppeal::count(),
    'pending' => BanAppeal::pending()->count(),
    'approved' => BanAppeal::approved()->count(),
    'rejected' => BanAppeal::rejected()->count(),
    'approval_rate' => BanAppeal::approvalRate(),
    'avg_review_time' => BanAppeal::averageReviewTime(),
];
```

### Apelaciones Pendientes Antiguas

```php
use App\Models\BanAppeal;

$oldAppeals = BanAppeal::pending()
    ->where('created_at', '<', now()->subDays(7))
    ->with(['user', 'userBan'])
    ->get();

// Enviar recordatorio a admins
foreach ($oldAppeals as $appeal) {
    // Notificar...
}
```

### Usuarios con Múltiples Apelaciones Rechazadas

```php
use App\Models\User;
use App\Models\BanAppeal;

$users = User::whereHas('banAppeals', function ($query) {
    $query->where('status', 'rejected');
}, '>=', 3)->get();
```

---

**Última actualización:** 30 de Octubre, 2025

