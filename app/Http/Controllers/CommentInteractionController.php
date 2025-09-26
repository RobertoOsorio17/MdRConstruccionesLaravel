<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Comment;
use App\Models\CommentInteraction;
use App\Models\CommentReport;

class CommentInteractionController extends Controller
{
    /**
     * Store a like interaction for a comment.
     */
    public function like(Request $request, Comment $comment): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar si ya existe una interacción del mismo tipo
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'like')
            ->first();
            
        if ($existingInteraction) {
            // Si ya existe, eliminarla (toggle)
            $existingInteraction->delete();
            $message = 'Like eliminado';
            $liked = false;
        } else {
            // Eliminar cualquier dislike existente
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'dislike')
                ->delete();
                
            // Crear nuevo like
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'like'
            ]);
            
            $message = 'Comentario marcado como útil';
            $liked = true;
        }
        
        // Obtener conteos actualizados
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'liked' => $liked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Store a dislike interaction for a comment.
     */
    public function dislike(Request $request, Comment $comment): JsonResponse
    {
        $user = Auth::user();
        
        // Verificar si ya existe una interacción del mismo tipo
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'dislike')
            ->first();
            
        if ($existingInteraction) {
            // Si ya existe, eliminarla (toggle)
            $existingInteraction->delete();
            $message = 'Dislike eliminado';
            $disliked = false;
        } else {
            // Eliminar cualquier like existente
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'like')
                ->delete();
                
            // Crear nuevo dislike
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'dislike'
            ]);
            
            $message = 'Comentario marcado como no útil';
            $disliked = true;
        }
        
        // Obtener conteos actualizados
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'disliked' => $disliked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Report a comment.
     */
    public function report(Request $request, Comment $comment): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'category' => 'nullable|string|in:spam,harassment,hate_speech,inappropriate,misinformation,off_topic,other',
            'description' => 'nullable|string|max:1000'
        ]);
        
        $user = Auth::user();
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();
        
        // Verificar si ya existe un reporte del mismo usuario o IP
        $existingReportQuery = CommentReport::where('comment_id', $comment->id);
        
        if ($user) {
            // Usuario autenticado: verificar por user_id
            $existingReportQuery->where('user_id', $user->id);
        } else {
            // Usuario invitado: verificar por IP en las últimas 24 horas
            $existingReportQuery->where('ip_address', $ipAddress)
                               ->where('created_at', '>', now()->subDay());
        }
        
        $existingReport = $existingReportQuery->first();
            
        if ($existingReport) {
            $message = $user 
                ? 'Ya has reportado este comentario'
                : 'Ya se ha reportado este comentario desde esta ubicación en las últimas 24 horas';
                
            return response()->json([
                'success' => false,
                'message' => $message
            ], 400);
        }
        
        // Crear nuevo reporte
        CommentReport::create([
            'user_id' => $user?->id,
            'comment_id' => $comment->id,
            'reason' => $request->reason,
            'category' => $request->category ?? 'other',
            'description' => $request->description,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'is_guest_report' => !$user
        ]);
        
        $successMessage = $user 
            ? 'Comentario reportado exitosamente. Nuestro equipo lo revisará pronto.'
            : 'Comentario reportado exitosamente. Ten en cuenta que los reportes falsos pueden resultar en el bloqueo de tu IP.';
        
        return response()->json([
            'success' => true,
            'message' => $successMessage
        ]);
    }
}