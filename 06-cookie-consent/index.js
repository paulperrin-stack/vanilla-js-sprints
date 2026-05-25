function initCookieBanner(banner) {

    const prefs       = banner.querySelector('[data-prefs]');
    const btnAccept   = banner.querySelector('[data-accept-all]');
    const btnReject   = banner.querySelector('[data-reject-all]');
    const btnManage   = banner.querySelector('[data-manage]');
    const stateEl     = document.querySelector('[data-consent-state]');

    const STORAGE_KEY = 'cookie_consent';

    // ── Cookie helpers ──────────────────────────────────────────
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
        return match ? decodeURIComponent(match.split('=')[1]) : null;
    }

    // ── Persist + dismiss ───────────────────────────────────────
    function saveConsent(analytics, marketing) {
        const payload = JSON.stringify({
            essential: true,
            analytics,
            marketing,
            savedAt: new Date().toISOString(),
        });
        setCookie(STORAGE_KEY, payload, 365);
        dismiss(analytics, marketing);
    }

    function dismiss(analytics, marketing) {
        banner.classList.add('hidden');

        // Show consent summary on the demo page
        if (stateEl) {
            stateEl.innerHTML =
                `<strong>Consent saved.</strong> `
                + `Essential: ✅ &nbsp;`
                + `Analytics: ${analytics ? '✅' : '❌'} &nbsp;`
                + `Marketing: ${marketing ? '✅' : '❌'}`;
            stateEl.classList.add('visible');
        }
    }

    // ── Read saved consent ──────────────────────────────────────
    function loadConsent() {
        const raw = getCookie(STORAGE_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    }

    // ── Toggle "Manage" panel ───────────────────────────────────
    function togglePrefs() {
        const isOpen = prefs.classList.toggle('open');
        btnManage.textContent = isOpen ? 'Hide' : 'Manage';

        // "Accept all" becomes "Save" when managing
        btnAccept.textContent = isOpen ? 'Save choices' : 'Accept all';
    }

    // ── Button handlers ─────────────────────────────────────────
    btnAccept.addEventListener('click', () => {
        if (prefs.classList.contains('open')) {
            // Save whatever the toggles say
            const analytics = banner.querySelector('[data-pref="analytics"]').checked;
            const marketing = banner.querySelector('[data-pref="marketing"]').checked;
            saveConsent(analytics, marketing);
        } else {
            saveConsent(true, true);
        }
    });

    btnReject.addEventListener('click', () => saveConsent(false, false));
    btnManage.addEventListener('click', togglePrefs);

    // ── On load: skip banner if already consented ───────────────
    const saved = loadConsent();
    if (saved) {
        dismiss(saved.analytics, saved.marketing);
    }
}

document.querySelectorAll('[data-cookie-banner]').forEach(initCookieBanner);