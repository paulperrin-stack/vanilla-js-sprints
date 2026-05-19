function initRestrictedTextarea(container) {
    const max      = parseInt(container.dataset.max, 10) || 200;
    const textarea = container.querySelector('textarea');
    const counter  = container.querySelector('.counter');
    const fill     = container.querySelector('.counter-bar-fill');

    const WARN_THRESHOLD = 0.8;   // 80 % — yellow
    const LIMIT_THRESHOLD = 1.0;  // 100 % — red

    counter.textContent = `0 / ${max}`;

    function update() {
        // Enforce hard limit
        if (textarea.value.length > max) {
            textarea.value = textarea.value.slice(0, max);
        }

        const len   = textarea.value.length;
        const ratio = len / max;

        const isWarn  = ratio >= WARN_THRESHOLD && ratio < LIMIT_THRESHOLD;
        const isLimit = ratio >= LIMIT_THRESHOLD;

        // Update counter text
        counter.textContent = `${len} / ${max}`;

        // Update progress bar width
        fill.style.width = `${Math.min(ratio * 100, 100)}%`;

        // Toggle state classes
        [textarea, counter, fill].forEach(el => {
            el.classList.toggle('warn',  isWarn);
            el.classList.toggle('limit', isLimit);
        });
    }

    textarea.addEventListener('input', update);

    // Support paste that exceeds the limit
    textarea.addEventListener('paste', () => setTimeout(update, 0));
}

document.querySelectorAll('[data-restricted-textarea]').forEach(initRestrictedTextarea);
