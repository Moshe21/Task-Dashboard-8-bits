document.addEventListener('DOMContentLoaded', function() {
    // Configurar la fecha de impresión
    document.body.setAttribute('data-print-date', new Date().toLocaleString());

    // Función para preparar la impresión
    window.addEventListener('beforeprint', function() {
        document.body.setAttribute('data-print-date', new Date().toLocaleString());
    });

    // Actualizar reloj digital
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;

        const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        document.getElementById('weekday').textContent = weekdays[now.getDay()];
    }

    // Actualizar reloj cada segundo
    updateClock();
    setInterval(updateClock, 1000);

    // Array de citas inspiradoras en español
    const quotes = [
        "Nunca olvides por qué empezaste este camino.",
        "El progreso, por pequeño que sea, sigue siendo progreso.",
        "Concéntrate en el proceso, no en el resultado.",
        "Todo experto fue una vez principiante.",
        "Tu yo del futuro te lo agradecerá.",
        "Cada día es una nueva oportunidad para mejorar.",
        "La constancia vence lo que la dicha no alcanza.",
        "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
    ];

    // Cambiar cita aleatoriamente cada 30 segundos
    function updateQuote() {
        const quoteElement = document.getElementById('inspiration-quote');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = `"${randomQuote}"`;
    }

    updateQuote();
    setInterval(updateQuote, 30000);

    // Cargar tareas guardadas
    loadTasks();

    // Funcionalidad del calendario
    function generateCalendar() {
        const calendar = document.getElementById('calendar');
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

        // Crear un mapa de fechas con proyectos
        const projectsByDate = {};
        savedProjects.forEach(project => {
            const projectDate = new Date(project.date);
            if (projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear()) {
                const day = projectDate.getDate();
                if (!projectsByDate[day]) {
                    projectsByDate[day] = [];
                }
                projectsByDate[day].push(project.name);
            }
        });

        // Limpiar calendario
        calendar.innerHTML = '';

        // Agregar días de la semana
        const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        weekDays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day weekday';
            dayElement.textContent = day;
            calendar.appendChild(dayElement);
        });

        // Agregar espacios vacíos para el primer día
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendar.appendChild(emptyDay);
        }

        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Marcar el día actual
            if (day === now.getDate()) {
                dayElement.classList.add('today');
            }

            // Agregar proyectos al día si existen
            if (projectsByDate[day]) {
                dayElement.classList.add('has-project');
                dayElement.setAttribute('data-project', projectsByDate[day].join(', '));
            }

            calendar.appendChild(dayElement);
        }
    }

    generateCalendar();

    // Cargar proyectos al iniciar
    loadProjects();
});

// Función para cargar proyectos desde localStorage
function loadProjects() {
    const projectList = document.getElementById('project-list');
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

    projectList.innerHTML = '';
    savedProjects.forEach(project => {
        createProjectElement(project);
    });
}

// Función para crear elemento de proyecto
function createProjectElement(project) {
    const projectList = document.getElementById('project-list');
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';

    const statusSelect = document.createElement('select');
    statusSelect.innerHTML = `
        <option value="pendiente" ${project.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
        <option value="proceso" ${project.status === 'proceso' ? 'selected' : ''}>En Proceso</option>
        <option value="finalizado" ${project.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
    `;
    statusSelect.className = project.status;
    statusSelect.onchange = (e) => updateProjectStatus(projectItem, e.target.value);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-project';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => removeProject(projectItem);

    projectItem.innerHTML = `
        <span class="project-name">${project.name}</span>
        <span class="project-subject">${project.subject}</span>
        <span class="project-date">${project.date}</span>
    `;

    projectItem.appendChild(statusSelect);
    projectItem.appendChild(deleteBtn);
    projectList.appendChild(projectItem);
}

// Función para agregar nuevo proyecto
function addProject() {
    const nameInput = document.getElementById('new-project-name');
    const subjectInput = document.getElementById('new-project-subject');
    const dateInput = document.getElementById('new-project-date');
    const statusInput = document.getElementById('new-project-status');

    const projectData = {
        name: nameInput.value.trim(),
        subject: subjectInput.value.trim(),
        date: dateInput.value,
        status: statusInput.value
    };

    if (!projectData.name || !projectData.subject || !projectData.date) return;

    createProjectElement(projectData);

    // Guardar en localStorage
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    savedProjects.push(projectData);
    localStorage.setItem('projects', JSON.stringify(savedProjects));

    // Limpiar inputs
    nameInput.value = '';
    subjectInput.value = '';
    dateInput.value = '';
    statusInput.value = 'pendiente';

    // Actualizar calendario
    updateCalendar();
}

// Función para actualizar estado del proyecto
function updateProjectStatus(projectItem, newStatus) {
    const projectName = projectItem.querySelector('.project-name').textContent;
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

    const projectIndex = savedProjects.findIndex(p => p.name === projectName);
    if (projectIndex > -1) {
        savedProjects[projectIndex].status = newStatus;
        localStorage.setItem('projects', JSON.stringify(savedProjects));

        const statusSelect = projectItem.querySelector('select');
        statusSelect.className = newStatus;
    }
}

// Función para eliminar proyecto
function removeProject(projectItem) {
    const projectName = projectItem.querySelector('.project-name').textContent;
    projectItem.remove();

    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = savedProjects.findIndex(p => p.name === projectName);
    if (projectIndex > -1) {
        savedProjects.splice(projectIndex, 1);
        localStorage.setItem('projects', JSON.stringify(savedProjects));

        // Actualizar calendario
        updateCalendar();
    }
}

// Función para cargar tareas desde localStorage
function loadTasks() {
    const tasksContainer = document.getElementById('daily-tasks');
    const savedTasks = JSON.parse(localStorage.getItem('daily-tasks') || '[]');

    tasksContainer.innerHTML = '';
    savedTasks.forEach(task => {
        createTaskElement(task);
    });
}

// Función para crear elemento de tarea
function createTaskElement(taskText) {
    const tasksContainer = document.getElementById('daily-tasks');
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${Date.now()}`;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = taskText;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-task';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => removeTask(taskItem);

    taskItem.appendChild(checkbox);
    taskItem.appendChild(label);
    taskItem.appendChild(deleteBtn);
    tasksContainer.appendChild(taskItem);
}

// Función para agregar nueva tarea
function addTask() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();

    if (taskText === '') return;

    createTaskElement(taskText);

    // Guardar en localStorage
    const savedTasks = JSON.parse(localStorage.getItem('daily-tasks') || '[]');
    savedTasks.push(taskText);
    localStorage.setItem('daily-tasks', JSON.stringify(savedTasks));

    input.value = '';
}

// Función para eliminar tarea
function removeTask(taskItem) {
    const taskText = taskItem.querySelector('label').textContent;
    taskItem.remove();

    // Actualizar localStorage
    const savedTasks = JSON.parse(localStorage.getItem('daily-tasks') || '[]');
    const taskIndex = savedTasks.indexOf(taskText);
    if (taskIndex > -1) {
        savedTasks.splice(taskIndex, 1);
        localStorage.setItem('daily-tasks', JSON.stringify(savedTasks));
    }
}

// Event listener para el input de nueva tarea
document.getElementById('new-task-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Hacer la lista de TODO interactiva
document.querySelectorAll('.todo-list li').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('completed');
    });
});

// Efectos hover para elementos interactivos
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseover', function() {
        this.style.transform = 'translateX(-5px)';
    });
    item.addEventListener('mouseout', function() {
        this.style.transform = 'translateX(0)';
    });
});

//Helper function to update the calendar
function updateCalendar() {
    generateCalendar();
}