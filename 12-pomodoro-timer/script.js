const MODES = {
    pomodoro: { label: 'Pomodoro',    seconds: 25 * 60 },
    short:    { label: 'Short break', seconds:  5 * 60 },
    long:     { label: 'Long break',  seconds: 15 * 60 },
};

let mode      = 'pomodoro';
let remaining = MODES[mode].seconds;
let running   = false;
let interval  = null;
let sessions  = 0;

const timerEl  = document.getElementById('timer');
const labelEl  = document.getElementById('sessionLabel');
const btnStart = document.getElementById('btnStart');
const btnReset = document.getElementById('btnReset');
const modebtns = {
    pomodoro: document.getElementById('btnPomodoro'),
    short:    document.getElementById('btnShort'),
    long:     document.getElementById('btnLong'),
};

function fmt(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function render() {
    timerEl.textContent = fmt(remaining);
    document.title      = `${fmt(remaining)} — ${MODES[mode].label}`;
    btnStart.textContent = running ? 'Pause' : 'Start';
    labelEl.textContent  = sessions > 0 ? `Sessions completed: ${sessions}` : '';
}

function setMode(m) {
    stop();
    mode      = m;
    remaining = MODES[m].seconds;
    Object.entries(modebtns).forEach(([key, btn]) =>
        btn.setAttribute('aria-pressed', String(key === m))
    );
    render();
}

function tick() {
    remaining--;
    render();
    if (remaining <= 0) {
        stop();
        if (mode === 'pomodoro') sessions++;
        notify(MODES[mode].label + ' complete!');
        render();
    }
}

function start() {
    running  = true;
    interval = setInterval(tick, 1000);
    render();
}

function stop() {
    running = false;
    clearInterval(interval);
    interval = null;
    render();
}

function notify(msg) {
    if (Notification.permission === 'granted') {
        new Notification(msg);
    }
}

btnStart.addEventListener('click', () => running ? stop() : start());

btnReset.addEventListener('click', () => {
    stop();
    remaining = MODES[mode].seconds;
    render();
});

modebtns.pomodoro.addEventListener('click', () => setMode('pomodoro'));
modebtns.short.addEventListener('click',    () => setMode('short'));
modebtns.long.addEventListener('click',     () => setMode('long'));

if (Notification.permission === 'default') Notification.requestPermission();

render();