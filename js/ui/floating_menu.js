export function initFloatingMenu() {
    const capsule = document.getElementById('floating-capsule');
    if (!capsule) return;

    let isDragging = false;
    let startY = 0;
    let currentTop = capsule.getBoundingClientRect().top;

    // Начало перетаскивания (тач)
    capsule.addEventListener('touchstart', (e) => {
        // Игнорируем нажатия на кнопки, чтобы они работали
        if (e.target.closest('button')) return;
        
        isDragging = true;
        startY = e.touches[0].clientY;
        currentTop = capsule.getBoundingClientRect().top;
        capsule.style.transition = 'none'; // Отключаем плавность на время перетаскивания
    }, { passive: true });

    // Процесс перетаскивания (тач)
    capsule.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY;
        const newTop = currentTop + deltaY;

        // Ограничиваем зону (от 100px до высоты экрана минус 250px)
        const minTop = 100;
        const maxTop = window.innerHeight - 250;

        if (newTop > minTop && newTop < maxTop) {
            capsule.style.bottom = 'auto';
            capsule.style.top = newTop + 'px';
        }
    }, { passive: true });

    // Конец перетаскивания (тач)
    capsule.addEventListener('touchend', () => {
        isDragging = false;
        capsule.style.transition = 'all 0.3s ease';
    });

    // === То же самое для ПК (мышка) ===
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
