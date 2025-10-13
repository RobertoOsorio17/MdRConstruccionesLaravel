<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Comentarios</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .filters {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .filters h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        .filters p {
            margin: 3px 0;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 11px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-approved {
            background: #4caf50;
            color: white;
        }
        .badge-pending {
            background: #ff9800;
            color: white;
        }
        .badge-rejected {
            background: #f44336;
            color: white;
        }
        .badge-spam {
            background: #9e9e9e;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Comentarios</h1>
        <p>MDR Construcciones</p>
        <p>Generado el: {{ $generated_at }}</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <h3>Filtros Aplicados:</h3>
        @if(isset($filters['status']))
            <p><strong>Estado:</strong> {{ ucfirst($filters['status']) }}</p>
        @endif
        @if(isset($filters['post_id']))
            <p><strong>Post ID:</strong> {{ $filters['post_id'] }}</p>
        @endif
        @if(isset($filters['user_id']))
            <p><strong>Usuario ID:</strong> {{ $filters['user_id'] }}</p>
        @endif
        @if(isset($filters['date_from']))
            <p><strong>Desde:</strong> {{ $filters['date_from'] }}</p>
        @endif
        @if(isset($filters['date_to']))
            <p><strong>Hasta:</strong> {{ $filters['date_to'] }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Post</th>
                <th>Autor</th>
                <th>Comentario</th>
                <th>Estado</th>
                <th>Likes</th>
                <th>Fecha</th>
            </tr>
        </thead>
        <tbody>
            @forelse($comments as $comment)
            <tr>
                <td>{{ $comment->id }}</td>
                <td>{{ $comment->post ? Str::limit($comment->post->title, 30) : 'N/A' }}</td>
                <td>{{ $comment->user ? $comment->user->name : $comment->author_name }}</td>
                <td>{{ Str::limit(strip_tags($comment->body), 60) }}</td>
                <td>
                    <span class="badge badge-{{ $comment->status }}">
                        {{ ucfirst($comment->status) }}
                    </span>
                </td>
                <td>{{ $comment->likes_count ?? 0 }}</td>
                <td>{{ $comment->created_at->format('d/m/Y') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No se encontraron comentarios con los filtros aplicados.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Total de comentarios: {{ $comments->count() }}</p>
        <p>© {{ date('Y') }} MDR Construcciones - Todos los derechos reservados</p>
    </div>
</body>
</html>

