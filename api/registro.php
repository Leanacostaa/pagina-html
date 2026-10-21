<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
exigir_metodo('POST');
$datos = leer_json();

$nombre = trim((string) ($datos['nombre'] ?? ''));
$email = strtolower(trim((string) ($datos['email'] ?? '')));
$password = (string) ($datos['password'] ?? '');

if ($nombre === '' || strlen($nombre) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    responder_json(422, ['error' => 'Ingresá un nombre y un correo válidos.']);
}
if (strlen($password) < 8 || strlen($password) > 72) {
    responder_json(422, ['error' => 'La contraseña debe tener entre 8 y 72 bytes.']);
}

try {
    $pdo = conectar_db();
    $hash = password_hash($password, PASSWORD_BCRYPT);
    if ($hash === false) {
        throw new RuntimeException('No se pudo generar el hash de contraseña.');
    }

    $consulta = $pdo->prepare('INSERT INTO usuarios (nombre, email, password) VALUES (:nombre, :email, :password)');
    $consulta->execute([
        'nombre' => $nombre,
        'email' => $email,
        'password' => $hash,
    ]);

    responder_json(201, ['mensaje' => 'Cuenta creada. Ahora podés iniciar sesión.']);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        responder_json(409, ['error' => 'Ya existe una cuenta con ese correo.']);
    }
    error_log('Error de registro: ' . $error->getMessage());
    responder_json(500, ['error' => 'No se pudo completar el registro.']);
} catch (Throwable $error) {
    error_log('Error de registro: ' . $error->getMessage());
    responder_json(500, ['error' => 'No se pudo completar el registro.']);
}