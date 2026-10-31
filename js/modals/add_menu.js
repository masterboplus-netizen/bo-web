export function openAddMenu() {
    const addBtn = document.getElementById('add-btn-floating');
    const existing = document.getElementById('add-menu-overlay');

    if (existing) {
        existing.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
        return;
    }

    if (addBtn) {
        addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    }

    const menuItems = [
        { text: 'Объект', action: () => window.openAddObject(), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>' },
        { text: 'Контрагент', action: () => window.showStub('Контрагент', 'crm'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
        { text: 'Документ', action: () => window.showStub('Документ', 'reports'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>' },
        { text: 'Дневник', action: () => window.showStub('Дневник', 'diary'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
        { text: 'Инструмент', action: () => window.showStub('Инструмент', 'objects'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>' },
        { text: 'Поступление', action: () => window.showStub('Поступление', 'finance'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>' },
        { text: 'Расход', action: () => window.showStub('Расход', 'finance'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
        { text: 'Задача', action: () => window.showStub('Задача', 'tasks'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' }
    ];

    const overlay = document.createElement('div');
    overlay.id = 'add-menu-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 999; display: flex; align-items: flex-end; justify-content: center;';

    let html = `
        <div id="add-menu-content" style="width: 100%; max-width: 500px; background: transparent; padding: 0 15px 15px 15px; margin-bottom: 140px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: var(--bg3); padding: 15px; border-radius: 16px;">
    `;

    menuItems.forEach((item, index) => {
        html += `
            <div class="add-menu-item" data-index="${index}" style="background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: var(--fg); height: 80px;">
                <span style="display: flex; align-items: center; justify-content: center; pointer-events: none;">${item.svg}</span> 
                <span style="font-size: 10px; font-weight: 500; text-align: center; pointer-events: none;">${item.text}</span>
            </div>
        `;
    });

    html += `</div>`;
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    const closeMenu = () => {
        overlay.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });

    overlay.querySelectorAll('.add-menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            closeMenu();
            menuItems[idx].action();
        });
    });
}

export function openAddObject() {
    window.showStub('Новый объект', 'objects');
}
