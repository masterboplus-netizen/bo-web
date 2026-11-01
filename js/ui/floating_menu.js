export function initFloatingMenu() {
    const capsule = document.getElementById('floating-capsule');
    if (!capsule) return;

    let isDragging = false;
    let startY = 0;
    let currentTop = capsule.getBoundingClientRect().top;

    capsule.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        startY = e.touches[0].clientY;
        currentTop = capsule.getBoundingClientRect().top;
        capsule.style.transition = 'none';
    }, { passive: false });

    capsule.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Блокируем скролл страницы при перетаскивании
        const deltaY = e.touches[0].clientY - startY;
        const newTop = currentTop + deltaY;
        const minTop = 100;
        const maxTop = window.innerHeight - 250;
        if (newTop > minTop && newTop < maxTop) {
            capsule.style.bottom = 'auto';
            capsule.style.top = newTop + 'px';
        }
    }, { passive: false });

    capsule.addEventListener('touchend', () => {
        isDragging = false;
        capsule.style.transition = 'all 0.3s ease';
    });

    capsule.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        startY = e.clientY;
        currentTop = capsule.getBoundingClientRect().top;
        capsule.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const newTop = currentTop + deltaY;
        const minTop = 100;
        const maxTop = window.innerHeight - 250;
        if (newTop > minTop && newTop < maxTop) {
            capsule.style.bottom = 'auto';
            capsule.style.top = newTop + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            capsule.style.transition = 'all 0.3s ease';
        }
    });
}
