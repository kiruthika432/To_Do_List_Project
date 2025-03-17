const input = document.getElementById('input');
const addBtn = document.getElementById('add');
const todoList = document.getElementById('todoList');
const showAllBtn = document.getElementById('showAll');
const showIncompleteBtn = document.getElementById('showIncomplete');
const showCompletedBtn = document.getElementById('showCompleted');
const showWorkBtn = document.getElementById('showWork');
const showPersonalBtn = document.getElementById('showPersonal');
const showUrgentBtn = document.getElementById('showUrgent');
const progress = document.querySelector('.progress');
const progressText = document.getElementById('progressText');
const categorySelect = document.getElementById('category');

let tasks = [];
let currentFilter = 'all'; // 'all', 'incomplete', 'completed', 'Work', 'Personal', 'Urgent'

// Load tasks from localStorage
if (localStorage.getItem('tasks')) {
  tasks = JSON.parse(localStorage.getItem('tasks'));
  renderTasks();
  updateProgress();
}

// Add Task
addBtn.addEventListener('click', () => {
  const taskText = input.value.trim();
  const category = categorySelect.value;
  if (taskText !== '') {
    tasks.push({ text: taskText, completed: false, category });
    input.value = '';
    saveTasks();
    renderTasks();
    updateProgress();
  }
});

// Render Tasks
function renderTasks() {
  todoList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'incomplete') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'Work') return task.category === 'Work';
    if (currentFilter === 'Personal') return task.category === 'Personal';
    if (currentFilter === 'Urgent') return task.category === 'Urgent';
    return true; // 'all'
  });

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement('div');
    taskItem.className = 'task' + (task.completed ? ' completed' : '');
    taskItem.style.backgroundColor = getRandomLightColor();
    taskItem.draggable = true;
    taskItem.dataset.index = index;
    taskItem.innerHTML = `
      <span>${task.text} (${task.category})</span>
      <div class="actions">
        <button onclick="toggleComplete(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
        <button onclick="editTask(${index})">Edit</button>
        <button onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    todoList.appendChild(taskItem);
  });

  // Enable drag-and-drop
  enableDragAndDrop();
}

// Toggle Complete
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  updateProgress();
}

// Edit Task
function editTask(index) {
  const newText = prompt('Edit your task:', tasks[index].text);
  if (newText !== null && newText.trim() !== '') {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

// Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  updateProgress();
}

// Update Progress Bar and Text
function updateProgress() {
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
  progress.style.width = `${progressPercentage}%`;
  progressText.textContent = `${Math.round(progressPercentage)}% (${completedTasksCount}/${totalTasks})`;
}

// Save Tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filter Tasks
showAllBtn.addEventListener('click', () => {
  currentFilter = 'all';
  renderTasks();
});

showIncompleteBtn.addEventListener('click', () => {
  currentFilter = 'incomplete';
  renderTasks();
});

showCompletedBtn.addEventListener('click', () => {
  currentFilter = 'completed';
  renderTasks();
});

showWorkBtn.addEventListener('click', () => {
  currentFilter = 'Work';
  renderTasks();
});

showPersonalBtn.addEventListener('click', () => {
  currentFilter = 'Personal';
  renderTasks();
});

showUrgentBtn.addEventListener('click', () => {
  currentFilter = 'Urgent';
  renderTasks();
});

// Drag-and-Drop Functionality
function enableDragAndDrop() {
  const draggables = document.querySelectorAll('.task');
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
      const newIndex = Array.from(todoList.children).indexOf(draggable);
      const oldIndex = draggable.dataset.index;
      if (newIndex !== oldIndex) {
        const [task] = tasks.splice(oldIndex, 1);
        tasks.splice(newIndex, 0, task);
        saveTasks();
        renderTasks();
      }
    });
  });

  todoList.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      todoList.appendChild(draggable);
    } else {
      todoList.insertBefore(draggable, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Generate Random Light Color
function getRandomLightColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

// Default view: Show all tasks
renderTasks();