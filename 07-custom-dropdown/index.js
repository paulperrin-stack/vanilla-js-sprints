function initDropdown(container) {
    const placeholder  = container.dataset.placeholder || 'Select…';
    const options      = JSON.parse(container.dataset.options || '[]');
    const display      = document.querySelector('[data-selected-display]');

    let selectedIndex  = -1;   // index in options[]
    let focusedIndex   = -1;   // keyboard cursor
    let isOpen         = false;

    // ── Build DOM ───────────────────────────────────────────────
    const trigger = document.createElement('button');
    trigger.className = 'dropdown-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', placeholder);
    trigger.innerHTML = `<span class="trigger-text placeholder">${placeholder}</span>
                       <span class="chevron" aria-hidden="true">▼</span>`;

    const list = document.createElement('ul');
    list.className = 'dropdown-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', placeholder);

    options.forEach((label, i) => {
        const li = document.createElement('li');
        li.className = 'dropdown-option';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.dataset.index = i;
        li.innerHTML = `<span>${label}</span><span class="check" aria-hidden="true">✓</span>`;
        list.appendChild(li);
    });

    container.appendChild(trigger);
    container.appendChild(list);

    const triggerText = trigger.querySelector('.trigger-text');
    const optionEls   = [...list.querySelectorAll('.dropdown-option')];

    // ── Open / close ────────────────────────────────────────────
    function open() {
        isOpen = true;
        list.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        // focus the selected item, else first
        moveFocus(selectedIndex >= 0 ? selectedIndex : 0);
    }

    function close() {
        isOpen = false;
        list.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        clearFocus();
        trigger.focus();
    }

    function toggle() { isOpen ? close() : open(); }

    // ── Selection ────────────────────────────────────────────────
    function select(index) {
        // deselect previous
        if (selectedIndex >= 0) {
            optionEls[selectedIndex].classList.remove('selected');
            optionEls[selectedIndex].setAttribute('aria-selected', 'false');
        }

        selectedIndex = index;
        optionEls[index].classList.add('selected');
        optionEls[index].setAttribute('aria-selected', 'true');

        triggerText.textContent = options[index];
        triggerText.classList.remove('placeholder');
        trigger.setAttribute('aria-label', options[index]);

        if (display) {
            display.querySelector('span').textContent = options[index];
            display.classList.add('visible');
        }

        close();
    }

    // ── Keyboard focus cursor ────────────────────────────────────
    function moveFocus(index) {
        clearFocus();
        focusedIndex = index;
        optionEls[index].classList.add('focused');
        optionEls[index].scrollIntoView({ block: 'nearest' });
        trigger.setAttribute('aria-activedescendant', optionEls[index].id || '');
    }

    function clearFocus() {
        if (focusedIndex >= 0) optionEls[focusedIndex].classList.remove('focused');
        focusedIndex = -1;
    }

    // ── Events ──────────────────────────────────────────────────
    trigger.addEventListener('click', toggle);

    trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ')     { e.preventDefault(); toggle(); }
        if (e.key === 'ArrowDown' && !isOpen)       { e.preventDefault(); open(); }
        if (e.key === 'Escape')                     { close(); }
    });

    list.addEventListener('keydown', e => {
        const last = options.length - 1;
        if (e.key === 'ArrowDown')  { e.preventDefault(); moveFocus(focusedIndex < last ? focusedIndex + 1 : 0); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); moveFocus(focusedIndex > 0    ? focusedIndex - 1 : last); }
        if (e.key === 'Home')       { e.preventDefault(); moveFocus(0); }
        if (e.key === 'End')        { e.preventDefault(); moveFocus(last); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focusedIndex >= 0) select(focusedIndex); }
        if (e.key === 'Escape')     { close(); }

        // Type-ahead: jump to first option starting with typed char
        if (e.key.length === 1) {
            const char  = e.key.toLowerCase();
            const start = focusedIndex + 1;
            const match = options.findIndex((o, i) => i >= start && o[0].toLowerCase() === char);
            const fallback = options.findIndex(o => o[0].toLowerCase() === char);
            const found = match >= 0 ? match : fallback;
            if (found >= 0) moveFocus(found);
        }
    });

    optionEls.forEach((el, i) => {
        el.addEventListener('click', () => select(i));
        el.addEventListener('mouseenter', () => moveFocus(i));
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!container.contains(e.target)) close();
    });

    // Make list focusable for keydown to fire
    list.setAttribute('tabindex', '-1');
    trigger.addEventListener('keydown', e => {
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && isOpen) {
            e.preventDefault();
            list.focus();
            moveFocus(focusedIndex >= 0 ? focusedIndex : (selectedIndex >= 0 ? selectedIndex : 0));
        }
    });
}

document.querySelectorAll('[data-dropdown]').forEach(initDropdown);
