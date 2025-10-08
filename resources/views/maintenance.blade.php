<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modo Mantenimiento - {{ $site_name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }

        .icon {
            font-size: 80px;
            margin-bottom: 30px;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .message {
            color: #666;
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .countdown {
            background: rgba(102, 126, 234, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
        }

        .countdown-label {
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .countdown-time {
            color: #333;
            font-size: 36px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }

        .site-name {
            color: #999;
            font-size: 14px;
            margin-top: 30px;
        }

        @media (max-width: 600px) {
            .container {
                padding: 40px 30px;
            }

            h1 {
                font-size: 24px;
            }

            .message {
                font-size: 16px;
            }

            .countdown-time {
                font-size: 28px;
            }
        }

        @isset($preview)
        .preview-banner {
            background: #fbbf24;
            color: #78350f;
            padding: 10px;
            text-align: center;
            font-weight: 600;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        @endisset
    </style>
</head>
<body>
    @isset($preview)
    <div class="preview-banner">
        🔍 VISTA PREVIA - Esta es una vista previa del modo mantenimiento
    </div>
    @endisset

    <div class="container">
        <div class="icon">🔧</div>
        
        <h1>Estamos en Mantenimiento</h1>
        
        <div class="message">
            {{ $message }}
        </div>

        @if($show_countdown && $end_at)
        <div class="countdown">
            <div class="countdown-label">Volveremos en:</div>
            <div class="countdown-time" id="countdown">Calculando...</div>
        </div>
        @endif

        <div class="site-name">
            {{ $site_name }}
        </div>
    </div>

    @if($show_countdown && $end_at)
    <script>
        const endDate = new Date('{{ $end_at }}').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                document.getElementById('countdown').innerHTML = '¡Ya casi!';
                // Reload page after maintenance ends
                setTimeout(() => location.reload(), 5000);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let countdownText = '';
            if (days > 0) countdownText += days + 'd ';
            countdownText += String(hours).padStart(2, '0') + ':';
            countdownText += String(minutes).padStart(2, '0') + ':';
            countdownText += String(seconds).padStart(2, '0');

            document.getElementById('countdown').innerHTML = countdownText;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    </script>
    @endif
</body>
</html>

