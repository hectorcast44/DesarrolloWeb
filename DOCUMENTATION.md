# Documentación del Sistema de Gestión de Alumnos

## Descripción
Este proyecto es una aplicación web CRUD (Create, Read, Update, Delete) para la gestión de alumnos, desarrollada con tecnologías web estándar y PHP/MySQL en el backend. El sistema permite administrar información de estudiantes, incluyendo sus fotos y carreras asociadas.

## Tecnologías Utilizadas
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend:** PHP (PDO para conexión segura).
- **Base de Datos:** MySQL.
- **Servidor:** Apache (XAMPP recomendado).

## Requisitos Previos
- Servidor web (Apache/Nginx).
- PHP 7.4 o superior.
- MySQL 5.7 o superior.
- Navegador web moderno.

## Instalación y Configuración

1.  **Base de Datos:**
    - Crear una base de datos llamada `sistema_escolar`.
    - Importar el script `sql/schema.sql` para crear las tablas, vistas, procedimientos y triggers.
    - *Nota:* El usuario administrador por defecto es `admin` con contraseña `admin123`.

2.  **Configuración de Conexión:**
    - Verificar el archivo `php/db.php`.
    - Asegurarse de que las credenciales (`$host`, `$user`, `$pass`, `$db`) coincidan con su entorno local.

3.  **Permisos:**
    - Asegurarse de que la carpeta `uploads/` tenga permisos de escritura para permitir la subida de imágenes.

## Estructura del Proyecto

- **css/**: Hojas de estilo (`style.css`). Incluye estilos para impresión (`@media print`).
- **js/**: Lógica del cliente (`app.js`). Maneja AJAX, validaciones, Drag & Drop y consumo de APIs.
- **php/**: Lógica del servidor.
    - `api.php`: Endpoints para operaciones CRUD y subida de archivos.
    - `auth.php`: Manejo de autenticación (Login/Logout).
    - `db.php`: Conexión a la base de datos.
- **sql/**: Scripts SQL (`schema.sql`).
- **uploads/**: Directorio para almacenar imágenes de alumnos.
- **index.html**: Página de inicio de sesión.
- **dashboard.html**: Panel principal de administración.

## Funcionalidades Principales

1.  **Autenticación:** Login seguro con sesiones PHP y contraseñas hasheadas.
2.  **Gestión de Alumnos:**
    - Listar alumnos (usando Vista SQL).
    - Agregar alumnos (usando Procedimiento Almacenado).
    - Editar y Eliminar alumnos.
    - Subida de fotos con **Drag & Drop**.
3.  **Búsqueda:** Filtrado en tiempo real por nombre o email.
4.  **Reportes:** Vista de impresión optimizada (oculta menús y botones).
5.  **Persistencia:** Uso de `LocalStorage` para recordar la última búsqueda.
6.  **Auditoría:** Registro automático de nuevos alumnos mediante **Triggers** en la tabla `logs`.

## APIs Externas Integradas

1.  **DummyJSON Quotes:** Muestra una "Frase del Día" aleatoria en el dashboard.
2.  **UI Avatars:** Genera avatares con iniciales automáticamente si el alumno no tiene foto.

## Base de Datos

El esquema incluye:
- **Tablas:** `usuarios`, `carreras`, `alumnos`, `logs`.
- **Relaciones:** `alumnos` vinculada a `carreras` (FK).
- **Vista:** `vista_alumnos_info` para consultas simplificadas.
- **Procedimiento:** `sp_crear_alumno` para inserciones controladas.
- **Trigger:** `after_alumno_insert` para auditoría.

## Video de demostración

El enlace a nuestro video:
https://www.youtube.com/watch?v=6GwDZ7KeiJs
