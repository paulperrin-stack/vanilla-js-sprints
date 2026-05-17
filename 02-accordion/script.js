function initAccordion(container) {
    const items = [...container.querySelectorAll('.accordion-item')];

    items.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const content = item.querySelector('.accordion-content');

        trigger.addEventListener('click', () => {
            const wasOpen = trigger.getAttribute('aria-expanded') === 'true';

            items.forEach(other => {
                other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
                other.querySelector('.accordion-content').style.maxHeight = '0px';
            });

            if (!wasOpen) {
                trigger.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}
document.querySelectorAll('[data-accordion]').forEach(initAccordion);