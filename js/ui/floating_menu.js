
export function initFloatingMenu() {
    const wrapper = document.getElementById('floating-capsule-wrapper');
    const capsule = document.getElementById('floating-capsule');
    const toggleBtn = document.getElementById('toggle-capsule');
    const toggleIcon = document.getElementById('toggle-icon');
    if (!wrapper || !capsule) return;

    let isDragging = false;
    let startY = 0;
    let currentTop = wrapper.getBoundingClientRect().top;
    let isCollapsed = false;

    // === ПЕРЕТАСКИВАНИЕ (ТАЧ) ===
    wrapper.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('#toggle-capsule')) return;
        isDragging = true;
        startY = e.touches[0].clientY;
        currentTop = wrapper.getBoundingClientRect().top;
        wrapper.style.transition = 'none';
    }, { passive: false });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaY = e.touches[0].clientY - startY;
        const newTop = currentTop + deltaY;
        const minTop = 100;
        const maxTop = window.innerHeight - 250;
        if (newTop > minTop && newTop < maxTop) {
            wrapper.style.bottom = 'auto';
            wrapper.style.top = newTop + 'px';
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            wrapper.style.transition = 'all 0.3s ease';
        }
    });

    // === ПЕРЕТАСКИВАНИЕ (МЫШКА) ===
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('#toggle-capsule')) return;
        isDragging = true;
        startY = e.clientY;
        currentTop = wrapper.getBoundingClientRect().top;
        wrapper.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const newTop = currentTop + deltaY;
        const minTop = 100;
        const maxTop = window.innerHeight - 250;
        if (newTop > minTop && newTop < maxTop) {
            wrapper.style.bottom = 'auto';
            wrapper.style.top = newTop + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            wrapper.style.transition = 'all 0.3s ease';
        }
    });

    // === СВОРАЧИВАНИЕ / РАЗВОРАЧИВАНИЕ (СДВИГ ВПРАВО) ===
    window.toggleCapsule = function(e) {
        e.stopPropagation();
        isCollapsed = !isCollapsed;

        if (isCollapsed) {
            // Сдвигаем вправо, оставляя только 20% (чтобы было за что зацепить)
            wrapper.style.transform = 'translateX(75%)';
            // Поворачиваем стрелочку влево
            toggleIcon.style.transform = 'rotate(90deg)';
        } else {
            // Возвращаем на место
            wrapper.style.transform = 'translateX(0)';
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    };
}
