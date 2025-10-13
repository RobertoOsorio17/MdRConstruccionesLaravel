<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Posts</title>
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
        .badge-published {
            background: #4caf50;
            color: white;
        }
        .badge-draft {
            background: #ff9800;
            color: white;
        }
        .badge-archived {
            background: #9e9e9e;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Posts</h1>
        <p>MDR Construcciones</p>
        <p>Generado el: {{ $generated_at }}</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <h3>Filtros Aplicados:</h3>
        @if(isset($filters['status']))
            <p><strong>Estado:</strong> {{ ucfirst($filters['status']) }}</p>
        @endif
        @if(isset($filters['category_id']))
            <p><strong>Categoría ID:</strong> {{ $filters['category_id'] }}</p>
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
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Vistas</th>
                <th>Fecha</th>
            </tr>
        </thead>
        <tbody>
            @forelse($posts as $post)
            <tr>
                <td>{{ $post->id }}</td>
                <td>{{ Str::limit($post->title, 40) }}</td>
                <td>{{ $post->user ? $post->user->name : 'N/A' }}</td>
                <td>{{ $post->category ? $post->category->name : 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ $post->status }}">
                        {{ ucfirst($post->status) }}
                    </span>
                </td>
                <td>{{ $post->views_count ?? 0 }}</td>
                <td>{{ $post->created_at->format('d/m/Y') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No se encontraron posts con los filtros aplicados.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Total de posts: {{ $posts->count() }}</p>
        <p>© {{ date('Y') }} MDR Construcciones - Todos los derechos reservados</p>
    </div>
</body>
</html>

