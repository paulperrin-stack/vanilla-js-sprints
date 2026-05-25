// ── Focus trap helper ─────────────────────────────────────────
function getFocusable(container) {
    return [...container.querySelectorAll(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )];
}

function trapFocus(e, container) {
    const focusable = getFocusable(container);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
}

// ── Init ─────────────────────────────────────────────────────
function initModal(overlay) {
    const modal        = overlay.querySelector('.modal');
    let   triggerEl    = null;   // element that opened this modal
    let   trapHandler  = null;

    function open(opener) {
        triggerEl = opener || null;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        // focus first focusable element inside
        const focusable = getFocusable(modal);
        if (focusable.length) focusable[0].focus();

        // attach focus trap
        trapHandler = e => trapFocus(e, modal);
        overlay.addEventListener('keydown', trapHandler);
    }

    function close() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';

        if (trapHandler) {
            overlay.removeEventListener('keydown', trapHandler);
            trapHandler = null;
        }

        // return focus to the opener
        if (triggerEl) triggerEl.focus();
    }

    // close buttons inside modal
    overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', close);
    });

    // click on overlay backdrop (not modal box itself)
    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    // Escape key
    overlay.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });

    // expose open so trigger buttons can call it
    overlay._open = open;
}

document.querySelectorAll('[data-modal]').forEach(initModal);

// ── Wire trigger buttons ──────────────────────────────────────
document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.modalOpen);
        if (target && target._open) target._open(btn);
    });
});