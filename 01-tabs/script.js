function initTabs(container) {
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));

    function activate(index) {
        tabs.forEach((tab, i) => {
            const selected = i === index;
            tab.setAttribute('aria-selected', selected);
            tab.tabIndex = selected ? 0 : -1;
            panels[i].hidden = !selected;
        });
        tabs[index].focus();
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activate(i));
        tab.addEventListener('keydown', (e) => {
            const last = tabs.length - 1;
            if (e.key === 'ArrowRight') activate(i === last ? 0 : i + 1);
            if (e.key === 'ArrowLeft')  activate(i === 0 ? last : i - 1);
            if (e.key === 'Home')       activate(0);
            if (e.key === 'End')        activate(last);
        });
    });
}
document.querySelectorAll('[data-tabs]').forEach(initTabs);