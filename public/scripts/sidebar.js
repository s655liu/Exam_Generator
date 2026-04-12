document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
        const viewGroup = item.dataset.view;
        const link = item.querySelector('a');
        
        // Remove active class initially
        item.classList.remove('active');

        // Check matching
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            if (viewGroup === 'dashboard') item.classList.add('active');
        } else if (currentPath.includes('models')) {
            if (viewGroup === 'models') item.classList.add('active');
        } else if (currentPath.includes('help')) {
            if (viewGroup === 'help') item.classList.add('active');
        }

        // Make the whole div clickable
        item.addEventListener('click', (e) => {
            if (link && e.target !== link) {
                link.click();
            }
        });
    });
});
