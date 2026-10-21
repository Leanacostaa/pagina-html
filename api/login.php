<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
exigir_metodo('POST');
$datos = leer_json();
$email = strtolower(trim((string) ($datos['email'] ?? '')));
$password = (string) ($datos['password'] ?? '');

if ($email === '' || $password === '') {
    responder_json(422, ['error' => 'Ingresá correo y contraseña.']);
}

try {
    $pdo = conectar_db();
    $consulta = $pdo->prepare('SELECT id, password FROM usuarios WHERE email = :email LIMIT 1');
    $consulta->execute(['email' => $email]);
    $usuario = $consulta->fetch();

    if (!$usuario || !password_verify($password, $usuario['password'])) {
        responder_json(401, ['error' => 'Correo o contraseña incorrectos.']);
    }

    iniciar_sesion_segura();
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $usuario['id'];

    responder_json(200, ['mensaje' => 'Sesión iniciada.']);
} catch (Throwable $error) {
    error_log('Error de login: ' . $error->getMessage());
    responder_json(500, ['error' => 'No se pudo iniciar sesión.']);
}