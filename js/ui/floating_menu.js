export const CAPSULE_ITEMS = [
  { id: 'nav-kpi', title: 'KPI', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>', action: "window.showStub('KPI', 'kpi')" },
  { id: 'nav-crm', title: 'CRM', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', action: "window.showStub('CRM', 'crm')" },
  { id: 'nav-finance', title: 'Финансы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', action: "window.showStub('Финансы', 'finance')" },
  { id: 'nav-reports', title: 'Отчёты', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', action: "window.showStub('Отчёты', 'reports')" },
  { id: 'nav-personal', title: 'Личные', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>', action: "window.showStub('Личные', 'personal')" },
  { id: 'nav-calendar', title: 'Календарь', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', action: "window.openCalendar()" },
  { id: 'nav-tasks', title: 'Задачи', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', action: "window.openTasks()" },
  { id: 'nav-diary', title: 'Дневник', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', action: "window.openDiary()" },
  { id: 'nav-objects', title: 'Объекты', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>', action: "window.openObjects()" },
  { id: 'nav-dictaphone', title: 'Диктофон', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>', action: "window.showStub('Диктофон', 'dictaphone')" },
  { id: 'nav-notepad', title: 'Блокнот', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>', action: "window.showStub('Блокнот', 'notepad')" },
  { id: 'nav-documents', title: 'Документы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', action: "window.showStub('Документы', 'documents')" },
  { id: 'nav-tools', title: 'Инструмент', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', action: "window.showStub('Инструмент', 'tools')" },
  { id: 'nav-materials', title: 'Материалы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', action: "window.showStub('Материалы', 'materials')" },
  { id: 'nav-equipment', title: 'Комплектация', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', action: "window.showStub('Комплектация', 'equipment')" },
  { id: 'nav-works', title: 'Работы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', action: "window.showStub('Работы', 'works')" },
  { id: 'nav-marketing', title: 'Маркетинг', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>', action: "window.showStub('Маркетинг', 'marketing')" },
  { id: 'nav-personnel', title: 'Персонал', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', action: "window.showStub('Персонал', 'personnel')" },
  { id: 'nav-knowledge', title: 'База знаний', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', action: "window.showStub('База знаний', 'knowledge')" }
];

export function renderCapsule() {
  const container = document.getElementById('capsule-dynamic-items');
  if (!container) return;

  let config = localStorage.getItem('widget_config');
  if (!config) {
    config = [
      { id: 'nav-personal', enabled: true },
      { id: 'nav-finance', enabled: true },
      { id: 'nav-diary', enabled: true },
      { id: 'nav-calendar', enabled: true },
      { id: 'nav-tasks', enabled: true },
      { id: 'nav-objects', enabled: true }
    ];
    localStorage.setItem('widget_config', JSON.stringify(config));
  } else {
    config = JSON.parse(config);
  }

  let html = '';
  config.forEach(cfg => {
    if (cfg.enabled) {
      const item = CAPSULE_ITEMS.find(i => i.id === cfg.id);
      if (item) {
        html += `<div class="nav-item" id="${item.id}" onclick="${item.action}" style="display: flex; align-items: center; justify-content: center; width: auto; padding: 6px 8px; cursor: pointer; gap: 8px;">
          ${item.icon}
          <span style="font-size: 11px;">${item.title}</span>
        </div>`;
      }
    }
  });
  container.innerHTML = html;
}

export function initFloatingMenu() {
  const wrapper = document.getElementById('floating-capsule-wrapper');
  const capsule = document.getElementById('floating-capsule');
  const toggleBtn = document.getElementById('toggle-capsule');
  const toggleIcon = document.getElementById('toggle-icon');
  const container = document.getElementById('capsule-dynamic-items');

  if (!wrapper || !capsule || !toggleBtn || !container) return;

  // 1. Сначала рендерим кнопки
  renderCapsule();

  // 2. Потом создаем Sortable (он уже видит все кнопки)
  if (typeof Sortable !== 'undefined') {
    new Sortable(container, {
      animation: 200,
      delay: 1500,
      delayOnTouchOnly: true,
      fallbackOnBody: true, // Перетаскиваемый элемент выносится поверх всего
      forceFallback: true, // Принудительно используем fallback (лучше для мобилок)
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      
      onChoose: function(evt) {
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        capsule.classList.add('capsule-shaking');
        if (navigator.vibrate) navigator.vibrate(50);
        
        evt.item.style.transform = 'scale(1.15)';
        evt.item.style.zIndex = '1000';
        evt.item.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
        evt.item.style.borderRadius = '12px';
        evt.item.style.background = 'var(--bg2)';
      },
      
      onUnchoose: function(evt) {
        if (!evt.item.classList.contains('sortable-drag')) {
          capsule.classList.remove('capsule-shaking');
        }
      },

      onEnd: function(evt) {
        document.body.style.overflow = ''; // Возвращаем скролл
        evt.item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); }; // Отменяем клик
        setTimeout(() => { evt.item.onclick = null; }, 100); // Возвращаем клик через 100мс
        capsule.classList.remove('capsule-shaking');
        evt.item.style.transform = '';
        evt.item.style.zIndex = '';
        evt.item.style.boxShadow = '';
        evt.item.style.borderRadius = '';
        evt.item.style.background = '';

        const newOrder = [];
        container.querySelectorAll('.nav-item').forEach(el => {
          newOrder.push({ id: el.id, enabled: true });
        });
        const savedConfig = JSON.parse(localStorage.getItem('widget_config')) || [];
        savedConfig.forEach(c => {
          if (!newOrder.find(n => n.id === c.id) && !c.enabled) {
            newOrder.push({ id: c.id, enabled: false });
          }
        });
        localStorage.setItem('widget_config', JSON.stringify(newOrder));
      }
    });
  }

  // Выход по тапу на экран
  document.addEventListener('click', (e) => {
    if (capsule.classList.contains('capsule-shaking') && !e.target.closest('#floating-capsule')) {
      capsule.classList.remove('capsule-shaking');
    }
  });

  // Перетаскивание самой капсулы
  let isDragging = false;
  let startY = 0;
  let currentTop = wrapper.getBoundingClientRect().top;
  let isCollapsed = false;

  wrapper.addEventListener('touchstart', (e) => {
    if (capsule.classList.contains('capsule-shaking')) return;
    if (e.target.closest('.nav-item')) return;
    if (e.target.closest('#toggle-capsule')) return;
    isDragging = true;
    startY = e.touches[0].clientY;
    currentTop = wrapper.getBoundingClientRect().top;
    wrapper.style.transition = 'none';
  }, { passive: false });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging || capsule.classList.contains('capsule-shaking')) return;
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

  wrapper.addEventListener('mousedown', (e) => {
    if (capsule.classList.contains('capsule-shaking')) return;
    if (e.target.closest('.nav-item')) return;
    if (e.target.closest('#toggle-capsule')) return;
    isDragging = true;
    startY = e.clientY;
    currentTop = wrapper.getBoundingClientRect().top;
    wrapper.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || capsule.classList.contains('capsule-shaking')) return;
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

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      capsule.style.transform = 'translateX(100%)';
      toggleIcon.style.transform = 'rotate(180deg)';
      wrapper.style.pointerEvents = 'none';
      toggleBtn.style.pointerEvents = 'auto';
    } else {
      capsule.style.transform = 'translateX(0)';
      toggleIcon.style.transform = 'rotate(0deg)';
      wrapper.style.pointerEvents = 'auto';
    }
  }

  toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); toggleCollapse(); });
  toggleBtn.addEventListener('touchend', (e) => { e.preventDefault(); toggleCollapse(); });
}

export function initCapsuleEditing() {}
