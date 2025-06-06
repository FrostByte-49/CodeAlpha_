document.addEventListener('DOMContentLoaded', function () {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
            iconSun.classList.add('hidden');
            iconMoon.classList.remove('hidden');
        } else {
            iconMoon.classList.add('hidden');
            iconSun.classList.remove('hidden');
        }
    });

    // Weekly Planner Functionality
    const weekGrid = document.getElementById('weekGrid');
    const weekRange = document.getElementById('weekRange');
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    const taskModal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelTaskBtn = document.getElementById('cancelTask');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');

    let currentDate = new Date();
    let currentWeekStart = getMonday(currentDate);
    let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {};
    let currentEditingTask = null;

    // Initialize the Planner
    renderWeek();

    // Week Navigation
    prevWeekBtn.addEventListener('click', function () {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeek();
    });

    nextWeekBtn.addEventListener('click', function () {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeek();
    });

    // Modal Controls
    closeModalBtn.addEventListener('click', closeModal);
    cancelTaskBtn.addEventListener('click', closeModal);

    // Form Submission
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveTask();
    });

    function renderWeek() {
        // Update Week Range Display
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        weekRange.textContent = `Week [ ${formatDate(currentWeekStart)} – ${formatDate(weekEnd)} ]`;

        // Clear the Week Grid
        weekGrid.innerHTML = '';

        // Create Day Columns for the Week
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        daysOfWeek.forEach((day, index) => {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + index);

            const dateKey = formatDateKey(dayDate);
            const dayTasks = tasks[dateKey] || [];

            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.dataset.date = dateKey;

            dayColumn.innerHTML = `
                        <div class="day-header">
                            <div class="day-name">${day}</div>
                            <div class="day-date">${formatDate(dayDate)}</div>
                        </div>
                        <div class="task-input-container">
                            <div class="task-input">
                                <input type="text" placeholder="Add a task..." class="day-task-input" data-day="${dateKey}">
                                <button class="add-task-btn" data-day="${dateKey}"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <ul class="task-list" data-day="${dateKey}">
                            ${dayTasks.length === 0 ? '<li class="empty-state">No tasks for this day</li>' : ''}
                        </ul>
                    `;

            weekGrid.appendChild(dayColumn);

            // Add event listeners for this day's elements
            const dayInput = dayColumn.querySelector('.day-task-input');
            const addBtn = dayColumn.querySelector('.add-task-btn');
            const taskList = dayColumn.querySelector('.task-list');

            dayInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    openAddModal(dateKey);
                }
            });

            addBtn.addEventListener('click', function () {
                openAddModal(dateKey);
            });

            // Render tasks for this day
            if (dayTasks.length > 0) {
                dayTasks.sort((a, b) => {
                    if (a.time && b.time) {
                        return a.time.localeCompare(b.time);
                    }
                    if (a.time && !b.time) return -1; 
                    if (!a.time && b.time) return 1; 
                    return 0; 
                });

                taskList.innerHTML = '';
                dayTasks.forEach((task, taskIndex) => {
                    if (dayTasks.length > 0) {
                        taskList.innerHTML = '';
                        dayTasks.forEach((task, taskIndex) => {
                            const taskItem = document.createElement('li');
                            taskItem.className = 'task-item';
                            taskItem.dataset.id = task.id;


                            taskItem.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <div class="task-text ${task.completed ? 'completed' : ''}">${task.title}</div>
                            ${task.time ? `<div class="task-time"><i class="far fa-clock"></i> ${task.time}</div>` : ''}
                            ${task.description ? `
                            <div class="task-description">
                                <div class="description-text">${task.description}</div>
                                ${task.description.length > 100 ? '<button class="read-more-btn">Read More</button>' : ''}
                            </div>
                            ` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="task-btn edit-btn" title="Edit task"><i class="far fa-edit"></i></button>
                            <button class="task-btn delete-btn" title="Delete task"><i class="far fa-trash-alt"></i></button>
                        </div>
                    `;

                            taskList.appendChild(taskItem);


                            // Add this inside the task rendering loop:
                            if (task.description) {
                                const readMoreBtn = taskItem.querySelector('.read-more-btn');
                                const descText = taskItem.querySelector('.description-text');

                                if (readMoreBtn) {
                                    readMoreBtn.addEventListener('click', function () {
                                        descText.classList.toggle('expanded');
                                        this.textContent = descText.classList.contains('expanded') ? 'Read Less' : 'Read More';
                                    });
                                }
                            }
                            // Add event listeners for task actions
                            const checkbox = taskItem.querySelector('.task-checkbox');
                            const editBtn = taskItem.querySelector('.edit-btn');
                            const deleteBtn = taskItem.querySelector('.delete-btn');
                            const taskText = taskItem.querySelector('.task-text');

                            checkbox.addEventListener('change', function () {
                                task.completed = this.checked;
                                taskText.classList.toggle('completed', this.checked);
                                saveAllTasks();
                            });

                            editBtn.addEventListener('click', function () {
                                openEditModal(dateKey, taskIndex);
                            });

                            deleteBtn.addEventListener('click', function () {
                                if (confirm('Are you sure you want to delete this task?')) {
                                    dayTasks.splice(taskIndex, 1);
                                    saveAllTasks();
                                    renderWeek();
                                }
                            });
                        });
                    }
                });
            }
        });
    }

    function openAddModal(dateKey) {
        currentEditingTask = null;
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskForm.dataset.day = dateKey;
        taskModal.style.display = 'flex';
        document.getElementById('taskTitle').focus();
    }

    function openEditModal(dateKey, taskIndex) {
        currentEditingTask = { dateKey, taskIndex };
        const task = tasks[dateKey][taskIndex];

        modalTitle.textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskTime').value = task.time || '';
        taskForm.dataset.day = dateKey;
        taskModal.style.display = 'flex';
        document.getElementById('taskTitle').focus();
    }

    function closeModal() {
        taskModal.style.display = 'none';
        currentEditingTask = null;
    }

    function saveTask() {
        const dateKey = taskForm.dataset.day;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const time = document.getElementById('taskTime').value;

        if (!title) return;

        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }

        const newTask = {
            id: Date.now(),
            title,
            description: description || undefined,
            time: time || undefined,
            completed: false
        };

        if (currentEditingTask) {
            // Update existing task
            tasks[currentEditingTask.dateKey][currentEditingTask.taskIndex] = newTask;
        } else {
            // Add new task
            tasks[dateKey].push(newTask);
        }

        saveAllTasks();
        renderWeek();
        closeModal();
    }

    function saveAllTasks() {
        localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
    }

    // Helper Functions
    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }
});