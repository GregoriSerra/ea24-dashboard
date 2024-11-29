<?php
// Configuramos cabeceras 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de conexión a la base de datos
$host = 'localhost'; //host por defecto 
$nombre_bd = 'Practica1ADIIU'; // Nombre de la base de datos de xampp
$usuario = 'root'; //usuario por defecto
$contrasena = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$nombre_bd;charset=utf8", $usuario, $contrasena);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Leer el tipo de datos solicitado (players y ligas)
    $tipo = $_GET['tipo'];

    if ($tipo === 'players') {
        // Obtenemos las medias más altas segmentadas por género (group by)
        $stmt = $pdo->query("
            SELECT overall, gender, COUNT(*) as count
            FROM players
            GROUP BY overall, gender
            ORDER BY overall DESC
        ");
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif ($tipo === 'ligas') {
        // Obtener la cantidad de jugadores por liga
        $stmt = $pdo->query("
            SELECT league, COUNT(*) as total
            FROM players
            GROUP BY league
            ORDER BY total DESC
        ");
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $datos = ['error' => 'Tipo no válido'];
    }

    echo json_encode($datos);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
