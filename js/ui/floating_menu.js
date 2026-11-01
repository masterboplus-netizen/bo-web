
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

    // ... (логика перетаскивания капсулы остается без изменений, я её не трогаю, чтобы не сломать)
    // ПЕРЕТАСКИВАНИЕ (ТАЧ)
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
            wrapper.style.transition = 'transform 0.3s ease';
        }
    });

    // ПЕРЕТАСКИВАНИЕ (МЫШКА)
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
            wrapper.style.transition = 'transform 0.3s ease';
        }
    });

    // СВОРАЧИВАНИЕ КАПСУЛЫ
    window.toggleCapsule = function(e) {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            wrapper.style.transform = 'translateX(92%)';
            toggleIcon.style.transform = 'rotate(0deg)';
        } else {
            wrapper.style.transform = 'translateX(0)';
            toggleIcon.style.transform = 'rotate(180deg)';
        }
    };

    // === СВОРАЧИВАНИЕ НИЖНЕГО РЯДА МЕНЮ ===
    window.toggleBottomNav = function() {
        const row2 = document.getElementById('bottom-nav-row2');
        const icon = document.getElementById('nav-toggle-icon');
        const btn = document.getElementById('nav-toggle');
        if (!row2) return;

        const isHidden = row2.style.transform === 'translateY(100%)';

        if (isHidden) {
            // Разворачиваем
            row2.style.transform = 'translateY(0)';
            btn.style.bottom = '70px'; // Поднимаем ручку над верхним рядом
            icon.style.transform = 'rotate(0deg)';
        } else {
            // Сворачиваем (сдвигаем вниз только второй ряд)
            row2.style.transform = 'translateY(100%)';
            btn.style.bottom = '0px'; // Ручка опускается вниз
            icon.style.transform = 'rotate(180deg)';
        }
    };
}
