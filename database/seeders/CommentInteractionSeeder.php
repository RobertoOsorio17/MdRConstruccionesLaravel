<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\User;
use App\Models\CommentInteraction;
use App\Models\CommentReport;

class CommentInteractionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todos los comentarios y usuarios
        $comments = Comment::all();
        $users = User::all();
        
        if ($comments->isEmpty() || $users->isEmpty()) {
            return;
        }
        
        // Crear interacciones (likes/dislikes) para comentarios
        foreach ($comments as $comment) {
            // Número aleatorio de interacciones por comentario (0-15)
            $interactionCount = rand(0, 15);
            
            // Seleccionar usuarios aleatorios para las interacciones
            $selectedUsers = $users->random(min($interactionCount, $users->count()));
            
            foreach ($selectedUsers as $user) {
                // 70% de probabilidad de like, 30% de dislike
                $type = (rand(1, 10) <= 7) ? 'like' : 'dislike';
                
                CommentInteraction::create([
                    'user_id' => $user->id,
                    'comment_id' => $comment->id,
                    'type' => $type
                ]);
            }
        }
        
        // Crear reportes para algunos comentarios
        $commentsToReport = $comments->random(min(5, $comments->count()));
        
        foreach ($commentsToReport as $comment) {
            // Número aleatorio de reportes por comentario (1-3)
            $reportCount = rand(1, 3);
            
            // Seleccionar usuarios aleatorios para los reportes
            $selectedUsers = $users->random(min($reportCount, $users->count()));
            
            foreach ($selectedUsers as $user) {
                CommentReport::create([
                    'user_id' => $user->id,
                    'comment_id' => $comment->id,
                    'reason' => $this->getRandomReportReason(),
                    'status' => ['pending', 'resolved', 'dismissed'][array_rand(['pending', 'resolved', 'dismissed'])]
                ]);
            }
        }
    }
    
    /**
     * Get a random report reason.
     */
    private function getRandomReportReason(): string
    {
        $reasons = [
            'Contenido ofensivo o inapropiado',
            'Spam o publicidad no solicitada',
            'Lenguaje vulgar o grosero',
            'Información falsa o engañosa',
            'Acoso o intimidación',
            'Violación de las normas de la comunidad',
            'Comentario repetitivo o irrelevante',
            'Contenido promocional excesivo'
        ];
        
        return $reasons[array_rand($reasons)];
    }
}