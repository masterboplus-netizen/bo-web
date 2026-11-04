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

  // ПЕРЕТАСКИВАНИЕ (ТАЧ) за саму капсулу
  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('button')) return;
    if (e.target.closest('#toggle-capsule')) return;
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
    if (newTop > 70 && newTop < window.innerHeight - wrapper.offsetHeight - 90) {
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

  // ПЕРЕТАСКИВАНИЕ (МЫШКА) за саму капсулу
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
    if (newTop > 70 && newTop < window.innerHeight - wrapper.offsetHeight - 90) {
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

  // СТРЕЛКА (только сворачивание, без перетаскивания)
    function toggleCollapse() {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      // Уводим капсулу далеко вправо (за экран). Стрелка останется на месте.
      capsule.style.transform = 'translateX(calc(100% + 50px))';
      toggleIcon.style.transform = 'rotate(180deg)';
    } else {
      capsule.style.transform = 'translateX(0)';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  }

  

  

  

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleCollapse();
  });

  // Для тача — тоже просто клик
  toggleBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleCollapse();
  });
}
