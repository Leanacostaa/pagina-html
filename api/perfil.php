<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
exigir_metodo('GET');
iniciar_sesion_segura();

if (!isset($_SESSION['usuario_id'])) {
    responder_json(401, ['error' => 'Se requiere iniciar sesión.']);
}

try {
    $pdo = conectar_db();
    $consulta = $pdo->prepare('SELECT nombre, email FROM usuarios WHERE id = :id LIMIT 1');
    $consulta->execute(['id' => (int) $_SESSION['usuario_id']]);
    $usuario = $consulta->fetch();

    if (!$usuario) {
        $_SESSION = [];
        session_destroy();
        responder_json(401, ['error' => 'La sesión ya no es válida.']);
    }

    responder_json(200, ['usuario' => $usuario]);
} catch (Throwable $error) {
    error_log('Error de perfil: ' . $error->getMessage());
    responder_json(500, ['error' => 'No se pudo consultar el perfil.']);
}