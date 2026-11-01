
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
        // Игнорируем нажатия на кнопки или на кнопку сворачивания
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

    // === СВОРАЧИВАНИЕ / РАЗВОРАЧИВАНИЕ ===
    window.toggleCapsule = function(e) {
        e.stopPropagation(); // Чтобы не срабатывало перетаскивание
        isCollapsed = !isCollapsed;

        // Находим кнопки (Камера и Диктофон), которые нужно скрыть
        const cameraBtn = capsule.querySelector('button:nth-child(1)');
        const micBtn = capsule.querySelector('button:nth-child(2)');

        if (isCollapsed) {
            cameraBtn.style.display = 'none';
            micBtn.style.display = 'none';
            toggleIcon.style.transform = 'rotate(180deg)';
            // Делаем капсулу круглой (убираем лишнее)
            capsule.style.borderRadius = '50%';
            capsule.style.padding = '4px';
            capsule.style.background = 'transparent';
            capsule.style.border = 'none';
            capsule.style.boxShadow = 'none';
        } else {
            cameraBtn.style.display = 'flex';
            micBtn.style.display = 'flex';
            toggleIcon.style.transform = 'rotate(0deg)';
            capsule.style.borderRadius = '30px';
            capsule.style.padding = '8px';
            capsule.style.background = 'var(--bg2)';
            capsule.style.border = '1px solid var(--bg3)';
            capsule.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        }
    };
}
