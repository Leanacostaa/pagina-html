<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
exigir_metodo('POST');
iniciar_sesion_segura();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $parametros['path'],
        'domain' => $parametros['domain'],
        'secure' => $parametros['secure'],
        'httponly' => $parametros['httponly'],
        'samesite' => $parametros['samesite'] ?? 'Strict',
    ]);
}
session_destroy();

responder_json(200, ['mensaje' => 'Sesión cerrada.']);