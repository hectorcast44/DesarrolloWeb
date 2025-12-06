const API_URL = 'php/api.php';
const AUTH_URL = 'php/auth.php';

async function checkSession() {
    try {
        const response = await fetch(`${AUTH_URL}?action=check`);
        const data = await response.json();
        if (data.logged_in) {
            const userDisplay = document.getElementById('user-display');
            if (userDisplay) userDisplay.textContent = data.username;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch(`${AUTH_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.success) {
            window.location.href = 'dashboard.html';
        } else {
            message.textContent = data.message;
        }
    } catch (error) {
        message.textContent = 'Error de conexión';
    }
}

async function logout() {
    await fetch(`${AUTH_URL}?action=logout`);
    window.location.href = 'index.html';
}

async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}?action=students`);
        const students = await response.json();
        renderTable(students);
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadCareers() {
    try {
        const response = await fetch(`${API_URL}?action=careers`);
        const careers = await response.json();
        const select = document.getElementById('carrera');
        if (!select) return; // Cláusula de guarda si el elemento no existe (ej. en la página de login)
        select.innerHTML = '<option value="">Seleccione una carrera</option>';
        careers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading careers:', error);
    }
}

async function searchStudents() {
    const query = document.getElementById('searchInput').value;
    localStorage.setItem('lastSearch', query); // Requisito de LocalStorage

    try {
        const response = await fetch(`${API_URL}?action=search&q=${encodeURIComponent(query)}`);
        const students = await response.json();
        renderTable(students);
    } catch (error) {
        console.error('Error searching:', error);
    }
}

function renderTable(students) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';

    students.forEach(student => {
        const tr = document.createElement('tr');
        // API 1: Respaldo de UI Avatars
        // Si no hay foto, generar una con iniciales
        const photoUrl = student.foto ? student.foto : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.nombre)}&background=random&color=fff`;
        
        tr.innerHTML = `
            <td><img src="${photoUrl}" class="thumbnail" alt="Foto"></td>
            <td>${student.nombre}</td>
            <td>${student.email}</td>
            <td>${student.carrera}</td>
            <td class="actions-col">
                <button class="btn" style="background: #333;" onclick='editStudent(${JSON.stringify(student)})'>Editar</button>
                <button class="btn" style="background: #dc3545;" onclick="deleteStudent(${student.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveStudent() {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    const id = document.getElementById('studentId').value;
    
    const action = id ? 'update' : 'create';
    
    // Validación básica
    if (!formData.get('nombre') || !formData.get('email') || !formData.get('carrera_id')) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            closeModal();
            loadStudents();
            form.reset();
        } else {
            alert('Error al guardar: ' + (data.error || 'Desconocido'));
        }
    } catch (error) {
        console.error('Error saving:', error);
        alert('Error de conexión');
    }
}

async function deleteStudent(id) {
    if (!confirm('¿Está seguro de eliminar este alumno?')) return;

    try {
        const response = await fetch(`${API_URL}?action=delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();

        if (data.success) {
            loadStudents();
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        console.error('Error deleting:', error);
    }
}

// Ayudantes del Modal
function openModal() {
    document.getElementById('studentModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Agregar Alumno';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('file-name').textContent = ''; // Reset file name display
}

function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
}

function editStudent(student) {
    openModal();
    document.getElementById('modalTitle').textContent = 'Editar Alumno';
    document.getElementById('studentId').value = student.id;
    document.getElementById('nombre').value = student.nombre;
    document.getElementById('email').value = student.email;
    
    // Establecer el ID de la carrera directamente
    if (student.carrera_id) {
        document.getElementById('carrera').value = student.carrera_id;
    }
}

// Cerrar modal si se hace clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('studentModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// API 2: Frase del Día
async function loadQuote() {
    try {
        // Cambiando a dummyjson ya que quotable.io podría ser inestable
        const response = await fetch('https://dummyjson.com/quotes/random');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // dummyjson devuelve { quote: "...", author: "..." }
        document.getElementById('quote-text').textContent = `"${data.quote}"`;
        document.getElementById('quote-author').textContent = `- ${data.author}`;
        document.getElementById('quote-box').style.display = 'flex';
    } catch (error) {
        console.log('Could not fetch quote:', error);
        // Frase de respaldo
        document.getElementById('quote-text').textContent = '"La educación es el arma más poderosa que puedes usar para cambiar el mundo."';
        document.getElementById('quote-author').textContent = '- Nelson Mandela';
        document.getElementById('quote-box').style.display = 'flex';
    }
}

// Configuración de lógica Drag & Drop (Llamar si existen los elementos, ej. en dashboard)
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('foto');
    const fileNameDisplay = document.getElementById('file-name');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateFileName(e.dataTransfer.files[0].name);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            updateFileName(fileInput.files[0].name);
        }
    });

    function updateFileName(name) {
        fileNameDisplay.textContent = `Archivo seleccionado: ${name}`;
    }
}

// Inicializar Drag & Drop cuando el DOM esté listo (o llamado desde script en dashboard)
document.addEventListener('DOMContentLoaded', setupDragAndDrop);
