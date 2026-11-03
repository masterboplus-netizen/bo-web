export function initFloatingMenu() {
  const wrapper = document.getElementById('floating-capsule-wrapper');
  const capsule = document.getElementById('floating-capsule');
  const toggleBtn = document.getElementById('toggle-capsule');
  const toggleIcon = document.getElementById('toggle-icon');

  if (!wrapper || !capsule || !toggleBtn) return;

  let isDragging = false;
  let startY = 0;
  let currentTop = wrapper.getBoundingClientRect().top;
  let isCollapsed = false;

  // ПЕРЕТАСКИВАНИЕ (ТАЧ) за саму капсулу (кроме кнопок и стрелки)
  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('button')) return;
    if (e.target.closest('#toggle-capsule')) return; // Стрелку обрабатываем отдельно
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
    if (newTop > 100 && newTop < window.innerHeight - 350) {
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
    if (e.target.closest('button')) return;
    if (e.target.closest('#toggle-capsule')) return;
    isDragging = true;
    startY = e.clientY;
    currentTop = wrapper.getBoundingClientRect().top;
    wrapper.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    const newTop = currentTop + deltaY;
    if (newTop > 100 && newTop < window.innerHeight - 350) {
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

  // ЛОГИКА СТРЕЛКИ (перетаскивание + сворачивание)
  let isDraggingArrow = false;
  let startYArrow = 0;
  let startTopArrow = 0;
  let moved = false;

  toggleBtn.addEventListener('touchstart', (e) => {
    isDraggingArrow = true;
    moved = false;
    startYArrow = e.touches[0].clientY;
    startTopArrow = wrapper.getBoundingClientRect().top;
    wrapper.style.transition = 'none';
  }, { passive: false });

  toggleBtn.addEventListener('touchmove', (e) => {
    if (!isDraggingArrow) return;
    e.preventDefault();
    moved = true;
    const deltaY = e.touches[0].clientY - startYArrow;
    const newTop = startTopArrow + deltaY;
    if (newTop > 100 && newTop < window.innerHeight - 350) {
      wrapper.style.bottom = 'auto';
      wrapper.style.top = newTop + 'px';
    }
  }, { passive: false });

  toggleBtn.addEventListener('touchend', (e) => {
    isDraggingArrow = false;
    wrapper.style.transition = 'transform 0.3s ease';
    if (!moved) {
      // Если не двигали, значит это клик на сворачивание
      e.preventDefault();
      isCollapsed = !isCollapsed;
      if (isCollapsed) {
        wrapper.style.right = '-100%';
        toggleIcon.style.transform = 'rotate(180deg)';
      } else {
        wrapper.style.right = '0';
        toggleIcon.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Для десктопа (клик мышкой)
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      wrapper.style.right = '-100%';
      toggleIcon.style.transform = 'rotate(180deg)';
    } else {
      wrapper.style.right = '0';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  });
}
