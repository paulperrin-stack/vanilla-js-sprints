function initSignup(container) {

    const formBody      = container.querySelector('.form-body');
    const submitBtn     = container.querySelector('[data-submit]');
    const successMsg    = container.querySelector('[data-success]');
    const strengthBar   = container.querySelector('.strength-bar');
    const strengthLabel = container.querySelector('[data-strength-label]');

    const inputs = {
        firstname : container.querySelector('#s-firstname'),
        lastname  : container.querySelector('#s-lastname'),
        email     : container.querySelector('#s-email'),
        password  : container.querySelector('#s-password'),
        confirm   : container.querySelector('#s-confirm'),
    };

    // ── Rules ───────────────────────────────────────────────────
    const RULES = {
        name(v) {
            if (!v)          return { ok: false, msg: 'Required.' };
            if (v.length < 2) return { ok: false, msg: 'At least 2 characters.' };
            return { ok: true, msg: '✓' };
        },
        email(v) {
            if (!v) return { ok: false, msg: 'Required.' };
            // simple but solid email check
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!re.test(v)) return { ok: false, msg: 'Enter a valid email address.' };
            return { ok: true, msg: '✓' };
        },
        password(v) {
            if (!v)          return { ok: false, msg: 'Required.' };
            if (v.length < 8) return { ok: false, msg: 'At least 8 characters.' };
            return { ok: true, msg: '✓' };
        },
        confirm(v) {
            if (!v) return { ok: false, msg: 'Required.' };
            if (v !== inputs.password.value) return { ok: false, msg: 'Passwords do not match.' };
            return { ok: true, msg: '✓' };
        },
    };

    // ── Password strength ───────────────────────────────────────
    const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    function calcStrength(v) {
        if (!v) return 0;
        let score = 0;
        if (v.length >= 8)              score++;
        if (v.length >= 12)             score++;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
        if (/\d/.test(v))               score++;
        if (/[^A-Za-z0-9]/.test(v))    score++;
        return Math.min(4, Math.ceil(score * 4 / 5));
    }

    function updateStrength(v) {
        const s = calcStrength(v);
        strengthBar.dataset.strength = v ? s : 0;
        strengthLabel.textContent = v ? STRENGTH_LABELS[s] : '';
    }

    // ── Field state helpers ─────────────────────────────────────
    function setFieldState(input, ok, msg) {
        const hint = container.querySelector(`[data-hint="${input.id}"]`);
        input.classList.toggle('valid',   ok === true);
        input.classList.toggle('invalid', ok === false);
        if (hint) {
            hint.textContent = msg || '';
            hint.className = 'field-hint' + (ok === false ? ' error' : ok === true ? ' ok' : '');
        }
    }

    function clearFieldState(input) {
        input.classList.remove('valid', 'invalid');
        const hint = container.querySelector(`[data-hint="${input.id}"]`);
        if (hint) { hint.textContent = ''; hint.className = 'field-hint'; }
    }

    // ── Validate single field ───────────────────────────────────
    function validateField(input) {
        const type   = input.dataset.validate;
        const rule   = RULES[type];
        if (!rule) return true;
        const result = rule(input.value.trim());
        setFieldState(input, result.ok, result.ok ? '' : result.msg);
        return result.ok;
    }

    // ── Live validation (on blur + on input after first touch) ──
    const touched = new Set();

    Object.values(inputs).forEach(input => {
        input.addEventListener('blur', () => {
            touched.add(input.id);
            validateField(input);
            // re-validate confirm when password changes
            if (input === inputs.password && touched.has('s-confirm')) {
                validateField(inputs.confirm);
            }
        });

        input.addEventListener('input', () => {
            if (input === inputs.password) {
                updateStrength(input.value);
                if (touched.has('s-confirm')) validateField(inputs.confirm);
            }
            if (touched.has(input.id)) validateField(input);
        });
    });

    // ── Password visibility toggles ─────────────────────────────
    container.querySelectorAll('[data-toggle-eye]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = container.querySelector(`#${btn.dataset.toggleEye}`);
            const show   = target.type === 'password';
            target.type  = show ? 'text' : 'password';
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
            btn.textContent = show ? '🙈' : '👁';
        });
    });

    // ── Submit ──────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        // touch all fields
        Object.values(inputs).forEach(input => touched.add(input.id));

        const allValid = Object.values(inputs).every(validateField);
        if (!allValid) return;

        // simulate async submit
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account…';

        setTimeout(() => {
            formBody.classList.add('hidden');
            successMsg.classList.add('visible');
        }, 800);
    });
}

document.querySelectorAll('[data-signup]').forEach(initSignup);