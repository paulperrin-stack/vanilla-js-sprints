function initConverter(container) {
    const inputs = [...container.querySelectorAll('input[data-unit]')];
    const resetBtn = container.querySelector('[data-reset]');

    const toCelsius = {
        c: v => v,
        f: v => (v - 32) * 5 / 9,
        k: v => v - 273.15,
    };

    const fromCelsius = {
        c: v => v,
        f: v => v * 9 / 5 + 32,
        k: v => v + 273.15,
    };

    function round(v) {
        return Math.round(v * 1e10) / 1e10;
    }

    function convert(sourceUnit, value) {
        const celsius = toCelsius[sourceUnit](value);
        inputs.forEach(input => {
            const unit = input.dataset.unit;
            if (unit === sourceUnit) return;
            input.value = isNaN(value) ? '' : round(fromCelsius[unit](celsius));
        });
    }

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            inputs.forEach(i => i.classList.remove('active'));
            if (input.value !== '') input.classList.add('active');
            convert(input.dataset.unit, value);
        });
        input.addEventListener('focus', () => {
            inputs.forEach(i => i.classList.remove('active'));
            if (input.value !== '') input.classList.add('active');
        });
        input.addEventListener('blur', () => {
            if (input.value === '') input.classList.remove('active');
        });
    });

    resetBtn.addEventListener('click', () => {
        inputs.forEach(i => { i.value = ''; i.classList.remove('active'); });
        inputs[0].focus();
    });
}

document.querySelectorAll('[data-converter]').forEach(initConverter);
