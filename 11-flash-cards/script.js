const cards = [
    { q: 'What does `typeof null` return?',         a: '"object" — a historical bug in JS.' },
    { q: 'Difference between `==` and `===`?',      a: '== coerces types; === checks value AND type.' },
    { q: 'What is a closure?',                      a: 'A function that retains access to its outer scope.' },
    { q: 'What does `Array.prototype.reduce` do?',  a: 'Reduces an array to a single value via an accumulator.' },
    { q: 'What is event delegation?',               a: 'One listener on a parent handles events from children via bubbling.' },
];

let index = 0;
let showing = 'q';

const cardEl = document.getElementById('card');
const counter = document.getElementById('counter');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

function render() {
    cardEl.textContent = showing === 'q' ? cards[index].q : cards[index].a;
    cardEl.classList.toggle('answer', showing === 'a');
    counter.textContent = `${index + 1} / ${cards.length}`;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === cards.length - 1;
}

function flip() {
    showing = showing === 'q' ? 'a' : 'q';
    render();
}

cardEl.addEventListener('click', flip);
cardEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Enter') { e.preventDefault(); flip(); } });

btnNext.addEventListener('click', () => { index++; showing = 'q'; render(); });
btnPrev.addEventListener('click', () => { index--; showing = 'q'; render(); });

render();