import { renderDiary } from './screens/diary.js';
import { renderNotepad } from './screens/notepad.js';
import { renderFinance } from './screens/finance.js';
import { renderCalendar } from './screens/calendar.js';
import { renderObjects } from './screens/objects.js';
import { initFloatingMenu, renderCapsule, CAPSULE_ITEMS } from './ui/floating_menu.js';
import { fetchObjects } from './api/objects.js';
import { openAddMenu } from './modals/add_menu.js';
import { initAudioButton } from './modals/audio_modal.js';
import './modals/camera_modal.js';
import { renderTasks, openNewTask, saveNewTask } from './screens/tasks.js';
import { openObject } from './screens/objectDetail.js';
import './screens/taskDetail.js';
import './screens/taskEdit.js';
import './modals/task_actions.js';
import './modals/task_photos.js';

function saveCurrentScreen(screen) {
    localStorage.setItem('currentScreen', screen);
}


window.openObject = openObject;

window.renderMainMenu = function() {
    document.getElementById('app-content').innerHTML = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в MasterBoss!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    setNavActive('main');
};

window.openObjects = async function() { saveCurrentScreen('objects');
    document.getElementById('app-content').innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);"></div>';
    try {
        const objects = await fetchObjects();
        renderObjects(objects);
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
    setNavActive('objects');
};

window.openTasks = function() { saveCurrentScreen('tasks'); renderTasks(); };
window.openNewTask = openNewTask;
window.saveNewTask = saveNewTask;
window.openAddMenu = openAddMenu;


window.openSettings = function() {
    document.getElementById('app-content').innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <h2 style="color: var(--fg); margin-bottom: 20px;">Настройки</h2>

            <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div onclick="window.openMenuSettings()" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--bg3);">
                    <span style="color: var(--fg);">Настройка меню</span>
                    <span style="color: var(--fg-dim);">Настроить →</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--fg);">Версия приложения</span>
                    <span style="color: var(--fg-dim);">7.1</span>
                </div>
            </div>
        </div>
    `;
    setNavActive('main');
};

window.showStub = function(title, tabId) {
    document.getElementById('app-content').innerHTML = `
        <div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
            <div style="margin-bottom: 20px; display: flex; justify-content: center;"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--fg-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"></path><path d="M4 18v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"></path><path d="M12 10V6"></path><path d="M12 6l4-2"></path><path d="M8 10L6 6"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg></div>
            <h3>${title}</h3>
            <p>Раздел в разработке.</p>
        </div>`;
    if (tabId) setNavActive(tabId);
};

export function setNavActive(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('nav-' + tabId);
    if (el) el.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => { const savedScreen = localStorage.getItem('currentScreen');
    setTimeout(() => initFloatingMenu(), 100);
    window.renderMainMenu();
    initAudioButton();
});
window.openCalendar = function() { saveCurrentScreen('calendar'); renderCalendar(); };
window.openDiary = function() { saveCurrentScreen('diary'); renderDiary(); };
window.openNotepad = function() { saveCurrentScreen('notepad'); renderNotepad(); };
window.saveCurrentScreen = saveCurrentScreen;
window.openFinance = function() { saveCurrentScreen('finance'); renderFinance(); };
window.setNavActive = setNavActive;
window.setNavActive = setNavActive;







window.openMenu = function() { setNavActive('menu');
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
};

window.openMenuSettings = function() {
    const container = document.getElementById('app-content');
    container.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <button onclick="window.openSettings()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад в настройки</button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Настройка меню</h2>

            <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div onclick="window.openWidgetSettings()" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="color: var(--fg);">Виджет</span>
                    <span style="color: var(--fg-dim);">Настроить →</span>
                </div>
            </div>
        </div>
    `;
};




window.openWidgetSettings = function() {
    const container = document.getElementById('app-content');
    let savedConfig = JSON.parse(localStorage.getItem('widget_config')) || [];
    
    if (savedConfig.length === 0) {
        savedConfig = [
            { id: 'nav-personal', enabled: true },
            { id: 'nav-finance', enabled: true },
            { id: 'nav-diary', enabled: true },
            { id: 'nav-calendar', enabled: true },
            { id: 'nav-tasks', enabled: true },
            { id: 'nav-objects', enabled: true }
        ];
        localStorage.setItem('widget_config', JSON.stringify(savedConfig));
    }

    let listHtml = '';
    CAPSULE_ITEMS.forEach(item => {
        const cfgItem = savedConfig.find(c => c.id === item.id);
        const isActive = cfgItem ? cfgItem.enabled : false;
        const bgColor = isActive ? 'var(--accent)' : 'var(--bg3)';
        const circlePos = isActive ? 'left: 24px;' : 'left: 2px;';

        listHtml += `
            <div class="widget-item" data-id="${item.id}" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg2); padding: 12px 15px; margin-bottom: 8px; border-radius: 12px; border: 1px solid var(--bg3);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="color: var(--fg); display: flex; align-items: center; width: 24px; justify-content: center;">${item.icon}</div>
                    <span style="color: var(--fg); font-size: 15px;">${item.title}</span>
                </div>
                <div class="widget-toggle-btn" data-id="${item.id}" style="position: relative; width: 48px; height: 28px; border-radius: 14px; background: ${bgColor}; cursor: pointer; transition: background 0.3s;">
                    <div style="position: absolute; top: 2px; ${circlePos} width: 24px; height: 24px; border-radius: 50%; background: white; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <button onclick="window.openMenuSettings()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад в настройки меню</button>
            <h2 style="color: var(--fg); margin-bottom: 10px;">Настройка виджета</h2>
            <p style="color: var(--fg-dim); font-size: 13px; margin-bottom: 20px;">Выберите до 6 кнопок (плюс кнопка «Меню» всегда первая).</p>
            <p style="color: var(--fg-dim); font-size: 13px; margin-bottom: 20px;">Для изменения порядка зажмите кнопку в самой капсуле на 1.5 секунды.</p>
            
            <div id="sortable-list">
                ${listHtml}
            </div>
        </div>
    `;

    document.querySelectorAll('.widget-toggle-btn').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const id = toggle.dataset.id;
            let cfg = JSON.parse(localStorage.getItem('widget_config')) || [];
            const activeCount = cfg.filter(c => c.enabled).length;
            const existing = cfg.find(c => c.id === id);
            const isCurrentlyActive = existing ? existing.enabled : false;

            if (!isCurrentlyActive && activeCount >= 6) {
                alert('Максимум 6 кнопок в настройках (плюс Меню = 7 в виджете).');
                return;
            }
            // Проверка на МИНИМУМ (должно быть включено хотя бы 2 в настройках + Меню = 3 в виджете)
            if (isCurrentlyActive && activeCount <= 2) {
                alert('Минимум 3 кнопки в виджете (Меню + хотя бы две).');
                return;
            }

            if (existing) {
                existing.enabled = !existing.enabled;
            } else {
                cfg.push({ id: id, enabled: true });
            }

            localStorage.setItem('widget_config', JSON.stringify(cfg));
            
            const newState = !isCurrentlyActive;
            toggle.style.background = newState ? 'var(--accent)' : 'var(--bg3)';
            toggle.querySelector('div').style.left = newState ? '24px' : '2px';

            renderCapsule();
        });
    });
};




// При загрузке страницы проверяем сохраненную вкладку и открываем её

// Восстанавливаем последнюю открытую вкладку при загрузке

window.showConfirm = function(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.2s ease;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 16px 20px; max-width: 320px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease;';
    
    modal.innerHTML = `
        <div style="color: var(--fg); font-size: 15px; margin-bottom: 16px; text-align: center; line-height: 1.4;">${message}</div>
        <div style="display: flex; gap: 10px;">
            <button id="confirm-cancel" style="flex: 1; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer; font-weight: 500;">Отмена</button>
            <button id="confirm-ok" style="flex: 1; padding: 12px; background: #ff3b30; color: white; border: none; border-radius: 10px; font-size: 14px; cursor: pointer; font-weight: bold;">Удалить</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    function close() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('confirm-cancel').onclick = close;
    document.getElementById('confirm-ok').onclick = () => {
        close();
        onConfirm();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };
};
