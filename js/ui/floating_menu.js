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
    const maxTop = window.innerHeight - 350;

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
    const maxTop = window.innerHeight - 350;

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

  // СВОРАЧИВАНИЕ (вешаем обработчик прямо здесь)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      
      if (isCollapsed) {
        wrapper.style.right = '-40px';
        toggleIcon.style.transform = 'rotate(180deg)';
      } else {
        wrapper.style.right = '8px';
        toggleIcon.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Делаем глобальную функцию на всякий случай
  window.toggleCapsule = function(e) {
    if (e) e.stopPropagation();
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      wrapper.style.right = '-40px';
      toggleIcon.style.transform = 'rotate(180deg)';
    } else {
      wrapper.style.right = '8px';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  };
}
