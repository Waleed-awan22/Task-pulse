// ===== 1. DATA =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== 2. HTML ELEMENTS Fetching =====
const taskNameInput  = document.getElementById("taskName");
const categorySelect = document.getElementById("category");
const addBtn         = document.getElementById("addBtn");
const hint           = document.getElementById("hint");
const taskList       = document.getElementById("taskList");

const statTotal     = document.getElementById("statTotal");
const statCompleted = document.getElementById("statCompleted");
const statRemaining = document.getElementById("statRemaining");
const statProgress  = document.getElementById("statProgress");
const progressFill  = document.getElementById("progressFill");

const searchInput = document.getElementById("searchInput");
const sortSelect  = document.getElementById("sortSelect");
const filterBtns  = document.querySelectorAll(".filter-btn");

let currentFilter = "all";
let searchText = "";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== 4. ADD TASK =====
function addTask() {
  const name = taskNameInput.value.trim();
  const category = categorySelect.value;
  const priority = document.querySelector('input[name="priority"]:checked').value;

  // Validation
  if (name === "") {
    hint.textContent = "Please enter a task name";
    return;
  }
  if (category === "") {
    hint.textContent = "Please select a category";
    return;
  }

  // Naya task object
  const newTask = {
    id: Date.now(),      // unique id
    name: name,
    category: category,
    priority: priority,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  render();

  // Form reset
  taskNameInput.value = "";
  categorySelect.value = "";   // 
  hint.textContent = "Task added!";
  taskNameInput.focus();
}

// ===== 5. COMPLETE / DELETE =====
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ===== 6. SEARCH + FILTER + SORT =====
function getVisibleTasks() {
  let list = [...tasks];

  if (searchText !== "") {
    list = list.filter(t => t.name.toLowerCase().includes(searchText));
  }

  // 2. Filter: All / Active / Completed
  if (currentFilter === "active") {
    list = list.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    list = list.filter(t => t.completed);
  }

  // 3. Sort
  const sortBy = sortSelect.value;
  const priorityRank = { High: 1, Medium: 2, Low: 3 };

  if (sortBy === "newest") {
    list.sort((a, b) => b.id - a.id);       
  } else if (sortBy === "oldest") {
    list.sort((a, b) => a.id - b.id);
  } else if (sortBy === "priority") {
    list.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }

  return list;
}

function render() {
  taskList.innerHTML = "";   
  const list = getVisibleTasks();   

  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-msg";
    empty.textContent = tasks.length === 0 ? "No tasks yet" : "No matching tasks";
    taskList.appendChild(empty);
  }

  list.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " done" : "");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Task name
    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = task.name;

    // Priority badge
    const priority = document.createElement("span");
    priority.className = "badge priority-" + task.priority.toLowerCase();
    priority.textContent = task.priority;

    // Category badge
    const category = document.createElement("span");
    category.className = "badge category-" + task.category.toLowerCase();
    category.textContent = task.category;

    // Delete button
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "🗑";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, name, priority, category, del);
    taskList.appendChild(li);
  });

  updateStats();
}

// ===== 8. STATS =====
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statRemaining.textContent = remaining;
  statProgress.textContent = progress + "%";
  progressFill.style.width = progress + "%";
}

// ===== 9. EVENTS =====
addBtn.addEventListener("click", addTask);

taskNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

searchInput.addEventListener("input", () => {
  searchText = searchInput.value.trim().toLowerCase();
  render();
});

sortSelect.addEventListener("change", render);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;   

    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

render();

const timerDisplay = document.getElementById("timerDisplay");
const startBtn     = document.getElementById("startBtn");
const pauseBtn     = document.getElementById("pauseBtn");
const resetBtn     = document.getElementById("resetBtn");

let secondsElapsed = 0;  
let timerId = null;       

function updateTimerDisplay() {
  const hours   = Math.floor(secondsElapsed / 3600);
  const minutes = Math.floor((secondsElapsed % 3600) / 60);
  const seconds = secondsElapsed % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    timerDisplay.textContent = String(hours).padStart(2, "0") + ":" + mm + ":" + ss;
  } else {
    timerDisplay.textContent = mm + ":" + ss;
  }
}

function startTimer() {
  if (timerId !== null) return;   
  timerId = setInterval(() => {
    secondsElapsed++;            
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  pauseTimer();
  secondsElapsed = 0;
  updateTimerDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay();