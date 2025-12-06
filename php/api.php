<?php
session_start();
require 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'students') {
        // Use the VIEW as requested
        $stmt = $pdo->query("SELECT * FROM vista_alumnos_info");
        echo json_encode($stmt->fetchAll());
    } elseif ($action === 'careers') {
        $stmt = $pdo->query("SELECT * FROM carreras");
        echo json_encode($stmt->fetchAll());
    } elseif ($action === 'search') {
        $q = $_GET['q'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM vista_alumnos_info WHERE nombre LIKE ? OR email LIKE ?");
        $stmt->execute(["%$q%", "%$q%"]);
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    if ($action === 'create') {
        $nombre = $_POST['nombre'];
        $email = $_POST['email'];
        $carrera_id = $_POST['carrera_id'];
        
        $fotoPath = '';
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileName = uniqid() . '_' . basename($_FILES['foto']['name']);
            if (move_uploaded_file($_FILES['foto']['tmp_name'], $uploadDir . $fileName)) {
                $fotoPath = 'uploads/' . $fileName;
            } else {
                // Debug: Failed to move file
                error_log("Failed to move uploaded file to $uploadDir$fileName");
                echo json_encode(['success' => false, 'error' => 'Error al mover el archivo subido. Verifique permisos.']);
                exit;
            }
        } else {
             if (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {
                 error_log("Upload error code: " . $_FILES['foto']['error']);
                 echo json_encode(['success' => false, 'error' => 'Error en la subida del archivo: Código ' . $_FILES['foto']['error']]);
                 exit;
             }
        }

        // Use Stored Procedure as requested
        try {
            $stmt = $pdo->prepare("CALL sp_crear_alumno(?, ?, ?, ?)");
            $stmt->execute([$nombre, $email, $carrera_id, $fotoPath]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }

    } elseif ($action === 'update') {
        $id = $_POST['id'];
        $nombre = $_POST['nombre'];
        $email = $_POST['email'];
        $carrera_id = $_POST['carrera_id'];
        
        // Handle photo update if provided
        $sql = "UPDATE alumnos SET nombre=?, email=?, carrera_id=?";
        $params = [$nombre, $email, $carrera_id];

        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileName = uniqid() . '_' . basename($_FILES['foto']['name']);
            if (move_uploaded_file($_FILES['foto']['tmp_name'], $uploadDir . $fileName)) {
                $fotoPath = 'uploads/' . $fileName;
                $sql .= ", foto=?";
                $params[] = $fotoPath;
            } else {
                 error_log("Failed to move uploaded file to $uploadDir$fileName");
                 echo json_encode(['success' => false, 'error' => 'Error al mover el archivo subido.']);
                 exit;
            }
        } elseif (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_OK && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {
             echo json_encode(['success' => false, 'error' => 'Error en la subida del archivo: Código ' . $_FILES['foto']['error']]);
             exit;
        }
        
        $sql .= " WHERE id=?";
        $params[] = $id;

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }

    } elseif ($action === 'delete') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'];
        
        try {
            $stmt = $pdo->prepare("DELETE FROM alumnos WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
?>
