const STORAGE_KEY = 'morning-todo-items';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const remainingCount = document.querySelector('#remaining-count');
const taskTotal = document.querySelector('#task-total');
const clearCompletedButton = document.querySelector('#clear-completed');
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeLabel = document.querySelector('.theme-label');
const emptyMessage = document.querySelector('#empty-message');
const filterButtons = document.querySelectorAll('.filter-button');

let todos = loadTodos();
let currentFilter = 'all';

const themeStorageKey = 'morning-todo-theme';
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function loadTodos() {
  try {
    const storedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(storedTodos) ? storedTodos : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.add('theme-choice-made');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-label', isDark ? '切換淺色模式' : '切換深色模式');
}

function getInitialTheme() {
  return localStorage.getItem(themeStorageKey) || (systemPrefersDark.matches ? 'dark' : 'light');
}

function createTodo(text) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
  };
}

function renderTodos() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = `todo-item${todo.completed ? ' completed' : ''}`;
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-check';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為${todo.completed ? '未完成' : '已完成'}`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  const completed = todos.some((todo) => todo.completed);
  emptyState.hidden = visibleTodos.length > 0;
  emptyMessage.textContent = getEmptyMessage();
  remainingCount.textContent = `未完成:${remaining} 項`;
  taskTotal.textContent = `${visibleTodos.length}/${todos.length} 項`;
  clearCompletedButton.disabled = !completed;
}

function getEmptyMessage() {
  if (currentFilter === 'active') return '太棒了,目前沒有未完成事項!';
  if (currentFilter === 'completed') return '還沒有已完成的事項。';
  return '還沒有任何待辦事項,新增一個吧!';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  todos.push(createTodo(text));
  saveTodos();
  renderTodos();
  form.reset();
  input.focus();
});

list.addEventListener('change', (event) => {
  if (!event.target.matches('.todo-check')) return;

  const todoItem = event.target.closest('.todo-item');
  const todo = todos.find((item) => item.id === todoItem.dataset.id);
  todo.completed = event.target.checked;
  saveTodos();
  renderTodos();
});

list.addEventListener('click', (event) => {
  if (!event.target.matches('.delete-button')) return;

  const todoItem = event.target.closest('.todo-item');
  todos = todos.filter((todo) => todo.id !== todoItem.dataset.id);
  saveTodos();
  renderTodos();
});

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderTodos();
  });
});

// 只有沒有手動選擇過主題時,才跟隨作業系統的設定。
systemPrefersDark.addEventListener('change', (event) => {
  if (!localStorage.getItem(themeStorageKey)) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

applyTheme(getInitialTheme());
renderTodos();