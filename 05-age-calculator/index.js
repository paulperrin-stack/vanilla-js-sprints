function initAgeCalculator(container) {

    const inputDay   = container.querySelector('[data-part="day"]');
    const inputMonth = container.querySelector('[data-part="month"]');
    const inputYear  = container.querySelector('[data-part="year"]');
    const hintDay    = container.querySelector('[data-hint-day]');
    const hintYear   = container.querySelector('[data-hint-year]');
    const errorEl    = container.querySelector('[data-error]');
    const calcBtn    = container.querySelector('[data-calculate]');
    const result     = container.querySelector('[data-result]');

    const valYears    = container.querySelector('[data-years]');
    const valMonths   = container.querySelector('[data-months]');
    const valDays     = container.querySelector('[data-days]');
    const valNextBday = container.querySelector('[data-next-birthday]');
    const valWeekday  = container.querySelector('[data-weekday]');
    const valTotal    = container.querySelector('[data-total-days]');

    const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // ── Date helpers (no libraries) ─────────────────────────────
    function daysInMonth(m, y) {
        // Day 0 of next month = last day of this month
        return new Date(y || 2001, m, 0).getDate();
    }

    function isLeapYear(y) {
        return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    }

    function calcAge(d, m, y) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let years  = today.getFullYear() - y;
        let months = today.getMonth() + 1 - m;   // getMonth() is 0-based
        let days   = today.getDate() - d;

        if (days < 0) {
            months--;
            days += daysInMonth(m === 1 ? 12 : m - 1, m === 1 ? y + years - 1 : y + years);
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    }

    function nextBirthdayDays(d, m) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const year  = today.getFullYear();

        let next = new Date(year, m - 1, d);
        if (next < today) next = new Date(year + 1, m - 1, d);

        return Math.round((next - today) / 86400000);
    }

    function totalDaysLived(d, m, y) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birth = new Date(y, m - 1, d);
        return Math.floor((today - birth) / 86400000);
    }

    function getWeekday(d, m, y) {
        return WEEKDAYS[new Date(y, m - 1, d).getDay()];
    }

    // ── Block non-digits ────────────────────────────────────────
    const PASS = new Set(['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End']);

    function blockNonDigit(e) {
        if (PASS.has(e.key) || e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) e.preventDefault();
    }

    function blockNonDigitPaste(e) {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^\d+$/.test(text)) e.preventDefault();
    }

    [inputDay, inputMonth, inputYear].forEach(el => {
        el.addEventListener('keydown', blockNonDigit);
        el.addEventListener('paste',   blockNonDigitPaste);
    });

    // ── Live restrict ───────────────────────────────────────────
    function vals() {
        return {
            d: parseInt(inputDay.value,   10) || null,
            m: parseInt(inputMonth.value, 10) || null,
            y: parseInt(inputYear.value,  10) || null,
        };
    }

    function restrictDay() {
        inputDay.value = inputDay.value.replace(/\D/g, '');
        const { m, y } = vals();
        const max = (m && y && String(y).length === 4) ? daysInMonth(m, y)
            : m                                   ? daysInMonth(m, 2001)
                : 31;

        let d = parseInt(inputDay.value, 10);
        if (inputDay.value.length >= 2 && d > max) { inputDay.value = String(max); d = max; }
        if (inputDay.value !== '' && d < 1)         { inputDay.value = '1'; }

        hintDay.textContent = `1 – ${max}`;
        hintDay.classList.remove('warn');
        setFieldState(inputDay, inputDay.value === '' ? null : d >= 1 && d <= max);
        if (inputDay.value.length === 2) inputMonth.focus();
    }

    function restrictMonth() {
        inputMonth.value = inputMonth.value.replace(/\D/g, '');
        let m = parseInt(inputMonth.value, 10);

        if (inputMonth.value.length >= 2 && m > 12) { inputMonth.value = '12'; m = 12; }
        if (inputMonth.value !== '' && m < 1)        { inputMonth.value = '1'; }

        setFieldState(inputMonth, inputMonth.value === '' ? null : m >= 1 && m <= 12);
        restrictDay();   // day max may change
        if (inputMonth.value.length === 2) inputYear.focus();
    }

    function restrictYear() {
        inputYear.value = inputYear.value.replace(/\D/g, '');
        const y = parseInt(inputYear.value, 10);
        const thisYear = new Date().getFullYear();

        if (inputYear.value.length === 4) {
            const ok = y >= 1 && y <= thisYear;
            setFieldState(inputYear, ok);
            hintYear.textContent  = ok ? 'e.g. 1990' : `Must be ≤ ${thisYear}`;
            hintYear.classList.toggle('warn', !ok);
        } else {
            setFieldState(inputYear, null);
            hintYear.textContent = 'e.g. 1990';
            hintYear.classList.remove('warn');
        }

        restrictDay();   // leap year may change Feb cap
    }

    function setFieldState(el, valid) {
        el.classList.toggle('valid',   valid === true);
        el.classList.toggle('invalid', valid === false);
    }

    inputDay.addEventListener('input',   restrictDay);
    inputMonth.addEventListener('input', restrictMonth);
    inputYear.addEventListener('input',  restrictYear);

    // ── Validate + calculate ────────────────────────────────────
    function validate() {
        const { d, m, y } = vals();
        [inputDay, inputMonth, inputYear].forEach(el => setFieldState(el, null));
        errorEl.textContent = '';

        if (!inputDay.value || !inputMonth.value || !inputYear.value) {
            if (!inputDay.value)   setFieldState(inputDay,   false);
            if (!inputMonth.value) setFieldState(inputMonth, false);
            if (!inputYear.value)  setFieldState(inputYear,  false);
            errorEl.textContent = 'All three fields are required.';
            return null;
        }

        if (String(inputYear.value).length < 4) {
            setFieldState(inputYear, false);
            errorEl.textContent = 'Enter a 4-digit year.';
            return null;
        }

        // Check date actually exists
        const probe = new Date(y, m - 1, d);
        if (probe.getFullYear() !== y || probe.getMonth() + 1 !== m || probe.getDate() !== d) {
            setFieldState(inputDay, false);
            errorEl.textContent = 'That date doesn\'t exist.';
            return null;
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (probe >= today) {
            [inputDay, inputMonth, inputYear].forEach(el => setFieldState(el, false));
            errorEl.textContent = 'Date of birth must be in the past.';
            return null;
        }

        return { d, m, y };
    }

    function calculate() {
        const dmy = validate();
        if (!dmy) return;

        const { d, m, y } = dmy;
        const age      = calcAge(d, m, y);
        const toNext   = nextBirthdayDays(d, m);
        const total    = totalDaysLived(d, m, y);
        const weekday  = getWeekday(d, m, y);

        valYears.textContent   = age.years;
        valMonths.textContent  = age.months;
        valDays.textContent    = age.days;
        valWeekday.textContent = weekday;
        valTotal.textContent   = total.toLocaleString();
        valNextBday.textContent = toNext === 0
            ? 'Today 🎂'
            : `${toNext} day${toNext === 1 ? '' : 's'}`;

        result.classList.add('visible');
    }

    calcBtn.addEventListener('click', calculate);
    [inputDay, inputMonth, inputYear].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
    });
}

document.querySelectorAll('[data-age-calculator]').forEach(initAgeCalculator);