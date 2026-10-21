<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder_json(int $estado, array $datos): never
{
    http_response_code($estado);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        responder_json(405, ['error' => 'Método no permitido.']);
    }
}

function leer_json(): array
{
    $tipo = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($tipo !== 'application/json') {
        responder_json(415, ['error' => 'Se requiere enviar datos JSON.']);
    }

    try {
        $datos = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        responder_json(400, ['error' => 'El JSON enviado no es válido.']);
    }

    if (!is_array($datos)) {
        responder_json(400, ['error' => 'El cuerpo JSON debe ser un objeto.']);
    }

    return $datos;
}

function iniciar_sesion_segura(): void
{
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function conectar_db(): PDO
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $puerto = getenv('DB_PORT') ?: '3306';
    $base = getenv('DB_NAME') ?: 'mercado_fresco';
    $usuario = getenv('DB_USER');
    $clave = getenv('DB_PASSWORD');

    if ($usuario === false || $clave === false) {
        throw new RuntimeException('Faltan DB_USER o DB_PASSWORD en el entorno.');
    }

    $dsn = "mysql:host={$host};port={$puerto};dbname={$base};charset=utf8mb4";
    return new PDO($dsn, $usuario, $clave, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}