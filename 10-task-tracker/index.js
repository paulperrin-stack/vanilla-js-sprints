function initTaskTracker(container) {

    const input      = container.querySelector('[data-input]');
    const btnAdd     = container.querySelector('[data-add]');
    const list       = container.querySelector('[data-list]');
    const emptyEl    = container.querySelector('[data-empty]');
    const emptyMsg   = container.querySelector('[data-empty-msg]');
    const summary    = container.querySelector('[data-summary]');
    const btnClear   = container.querySelector('[data-clear-done]');
    const filterBtns = [...container.querySelectorAll('[data-filter]')];

    const STORAGE_KEY = 'sprint_tasks';
    let filter = 'all';

    // ── State ───────────────────────────────────────────────────
    function loadTasks() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    let tasks = loadTasks();

    function nextId() {
        return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    }

    // ── Render ──────────────────────────────────────────────────
    function renderTasks() {
        const pending = tasks.filter(t => !t.done);
        const done    = tasks.filter(t =>  t.done);
        const sorted  = [...pending, ...done];

        const visible = filter === 'all'     ? sorted
            : filter === 'pending' ? pending
                : done;

        // counts
        container.querySelector('[data-count="all"]').textContent     = tasks.length;
        container.querySelector('[data-count="pending"]').textContent = pending.length;
        container.querySelector('[data-count="done"]').textContent    = done.length;

        // summary
        summary.textContent = tasks.length
            ? `${pending.length} task${pending.length !== 1 ? 's' : ''} remaining`
            : '';

        // clear button
        btnClear.disabled = done.length === 0;

        // empty state
        const isEmpty = visible.length === 0;
        emptyEl.classList.toggle('visible', isEmpty);
        emptyMsg.textContent = tasks.length === 0
            ? 'No tasks yet. Add one above.'
            : `No ${filter} tasks.`;

        // build list
        list.innerHTML = '';
        visible.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.done ? ' done' : '');
            li.dataset.id = task.id;
            li.innerHTML = `
        <input class="task-check" type="checkbox" aria-label="Mark complete"
               ${task.done ? 'checked' : ''} data-action="toggle" />
        <span class="task-text" role="button" tabindex="0"
              aria-label="${task.text}" data-action="edit">${task.text}</span>
        <button class="btn-delete" aria-label="Delete task" data-action="delete">✕</button>`;
            list.appendChild(li);
        });
    }

    // ── Actions ─────────────────────────────────────────────────
    function addTask() {
        const text = input.value.trim();
        if (!text) { input.focus(); return; }
        tasks.push({ id: nextId(), text, done: false });
        saveTasks(tasks);
        renderTasks();
        input.value = '';
        input.focus();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) { task.done = !task.done; saveTasks(tasks); renderTasks(); }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks(tasks);
        renderTasks();
    }

    function clearDone() {
        tasks = tasks.filter(t => !t.done);
        saveTasks(tasks);
        renderTasks();
    }

    // ── Inline edit ──────────────────────────────────────────────
    function startEdit(span, id) {
        span.contentEditable = 'true';
        span.focus();

        // move cursor to end
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        function commit() {
            span.contentEditable = 'false';
            const newText = span.textContent.trim();
            if (!newText) {
                deleteTask(id);
                return;
            }
            const task = tasks.find(t => t.id === id);
            if (task) { task.text = newText; saveTasks(tasks); }
            span.removeEventListener('blur',    commit);
            span.removeEventListener('keydown', onKey);
        }

        function onKey(e) {
            if (e.key === 'Enter')  { e.preventDefault(); commit(); }
            if (e.key === 'Escape') {
                span.contentEditable = 'false';
                renderTasks();   // revert
                span.removeEventListener('blur',    commit);
                span.removeEventListener('keydown', onKey);
            }
        }

        span.addEventListener('blur',    commit);
        span.addEventListener('keydown', onKey);
    }

    // ── Event delegation ─────────────────────────────────────────
    list.addEventListener('click', e => {
        const el   = e.target.closest('[data-action]');
        if (!el) return;
        const id   = parseInt(el.closest('[data-id]').dataset.id, 10);
        const action = el.dataset.action;

        if (action === 'toggle') toggleTask(id);
        if (action === 'delete') deleteTask(id);
        if (action === 'edit') {
            const task = tasks.find(t => t.id === id);
            if (task && !task.done) startEdit(el, id);
        }
    });

    list.addEventListener('keydown', e => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
        }
    });

    // ── Filters ──────────────────────────────────────────────────
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filter = btn.dataset.filter;
            filterBtns.forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-selected', b === btn);
            });
            renderTasks();
        });
    });

    // ── Add ──────────────────────────────────────────────────────
    btnAdd.addEventListener('click', addTask);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

    btnClear.addEventListener('click', clearDone);

    // ── Boot ─────────────────────────────────────────────────────
    renderTasks();
}

document.querySelectorAll('[data-task-tracker]').forEach(initTaskTracker);