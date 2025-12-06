CREATE DATABASE IF NOT EXISTS sistema_escolar;
USE sistema_escolar;

-- Tabla de Usuarios para el Login
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Insertar usuario por defecto (admin / admin123)
INSERT INTO usuarios (username, password) VALUES ('admin', '$2y$12$N7zQfvliwpTREWxxmxefq.u.a7yWXgRFwTvAuDsJYpN0mhDqNLgFK');

-- Tabla Catalogo Vinculado: Carreras
CREATE TABLE IF NOT EXISTS carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

INSERT INTO carreras (nombre) VALUES ('Ingeniería de Software'), ('Arquitectura'), ('Derecho'), ('Medicina');

-- Tabla Principal: Alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    carrera_id INT,
    foto VARCHAR(255),
    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
);

-- Tabla para Logs (Trigger)
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VISTA (Snapshot)
CREATE OR REPLACE VIEW vista_alumnos_info AS
SELECT a.id, a.nombre, a.email, c.nombre as carrera, a.carrera_id, a.foto
FROM alumnos a
JOIN carreras c ON a.carrera_id = c.id;

-- PROCEDIMIENTO ALMACENADO
DELIMITER //
CREATE PROCEDURE sp_crear_alumno(
    IN p_nombre VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_carrera_id INT,
    IN p_foto VARCHAR(255)
)
BEGIN
    INSERT INTO alumnos (nombre, email, carrera_id, foto) 
    VALUES (p_nombre, p_email, p_carrera_id, p_foto);
END //
DELIMITER ;

-- DISPARADOR (Trigger)
DELIMITER //
CREATE TRIGGER after_alumno_insert
AFTER INSERT ON alumnos
FOR EACH ROW
BEGIN
    INSERT INTO logs (mensaje) VALUES (CONCAT('Nuevo alumno insertado: ', NEW.nombre));
END //
DELIMITER ;
