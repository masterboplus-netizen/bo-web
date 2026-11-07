export function openMenu() {
    if (window.setNavActive) window.setNavActive('menu');
    const container = document.getElementById('app-content');

    let html = `
        <div style="padding: 15px; max-width: 100%; margin: 0 auto; padding-bottom: 80px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <div onclick="window.openObjects()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Объекты</span>
                </div>
                <div onclick="window.openTasks()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Задачи</span>
                </div>
                <div onclick="window.openCalendar()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Календарь</span>
                </div>
                <div onclick="window.openDiary()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Дневник</span>
                </div>

                <div onclick="window.showStub('KPI', 'kpi')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">KPI</span>
                </div>
                <div onclick="window.showStub('CRM', 'crm')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">CRM</span>
                </div>
                <div onclick="window.openFinance()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Финансы</span>
                </div>
                <div onclick="window.showStub('Отчёты', 'reports')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Отчёты</span>
                </div>
                <div onclick="window.showStub('Личные', 'personal')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Личные</span>
                </div>
                <div onclick="window.showStub('Диктофон', 'dictaphone')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Диктофон</span>
                </div>
                <div onclick="window.openNotepad()" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Блокнот</span>
                </div>
                <div onclick="window.showStub('Документы', 'documents')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Документы</span>
                </div>
                <div onclick="window.showStub('Инструмент', 'tools')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Инструмент</span>
                </div>
                <div onclick="window.showStub('Материалы', 'materials')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Материалы</span>
                </div>
                <div onclick="window.showStub('Комплектация', 'equipment')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Комплектация</span>
                </div>
                <div onclick="window.showStub('Работы', 'works')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Работы</span>
                </div>
                <div onclick="window.showStub('Маркетинг', 'marketing')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Маркетинг</span>
                </div>
                <div onclick="window.showStub('Персонал', 'personnel')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">Персонал</span>
                </div>
                <div onclick="window.showStub('База знаний', 'knowledge')" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); padding: 12px 5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <span style="color: var(--fg); font-size: 10px; text-align: center;">База знаний</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

window.openMenu = openMenu;
