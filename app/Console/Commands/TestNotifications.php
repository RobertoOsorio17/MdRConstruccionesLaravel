<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:notifications {--count=5 : Number of test notifications to create}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test notifications for the admin panel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = $this->option('count');

        $this->info("Creating {$count} test notifications...");

        $types = ['info', 'success', 'warning', 'error'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        $notifications = [
            [
                'type' => 'info',
                'title' => 'Nuevo Comentario',
                'message' => 'Juan Pérez comentó en el post "Construcción Moderna"',
                'priority' => 'high',
                'action_url' => route('admin.comments.index'),
                'action_text' => 'Ver Comentarios',
            ],
            [
                'type' => 'success',
                'title' => 'Nueva Solicitud de Contacto',
                'message' => 'María García solicitó información sobre Remodelación',
                'priority' => 'high',
                'action_url' => route('admin.contact-requests.index'),
                'action_text' => 'Ver Solicitudes',
            ],
            [
                'type' => 'warning',
                'title' => 'Comentario Pendiente de Aprobación',
                'message' => 'Hay 3 comentarios esperando aprobación',
                'priority' => 'medium',
                'action_url' => route('admin.comments.index'),
                'action_text' => 'Revisar',
            ],
            [
                'type' => 'info',
                'title' => 'Nuevo Usuario Registrado',
                'message' => 'Carlos López se registró en la plataforma',
                'priority' => 'low',
                'action_url' => route('admin.users.index'),
                'action_text' => 'Ver Usuarios',
            ],
            [
                'type' => 'success',
                'title' => 'Post Publicado',
                'message' => 'El post "Diseño de Interiores" fue publicado exitosamente',
                'priority' => 'low',
                'action_url' => route('admin.posts.index'),
                'action_text' => 'Ver Posts',
            ],
        ];

        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $notification = $notifications[$i % count($notifications)];

            \App\Models\AdminNotification::createSystem($notification);

            $created++;
            $this->info("✓ Created: {$notification['title']}");
        }

        $this->newLine();
        $this->info("✅ Successfully created {$created} test notifications!");
        $this->info("📊 Check the admin panel to see them.");

        return 0;
    }
}
