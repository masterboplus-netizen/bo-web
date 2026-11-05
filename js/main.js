import { renderDiary } from './screens/diary.js';
import { renderCalendar } from './screens/calendar.js';
import { renderObjects } from './screens/objects.js';
import { initFloatingMenu } from './ui/floating_menu.js';
import { fetchObjects } from './api/objects.js';
import { openAddMenu } from './modals/add_menu.js';
import { initAudioButton } from './modals/audio_modal.js';
import './modals/camera_modal.js';
import { renderTasks, openNewTask, saveNewTask } from './screens/tasks.js';
import { openObject } from './screens/objectDetail.js';

window.openObject = openObject;

window.renderMainMenu = function() {
    document.getElementById('app-content').innerHTML = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в MasterBoss!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    setNavActive('main');
};

window.openObjects = async function() {
    document.getElementById('app-content').innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);"></div>';
    try {
        const objects = await fetchObjects();
        renderObjects(objects);
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
    setNavActive('objects');
};

window.openTasks = renderTasks;
window.openNewTask = openNewTask;
window.saveNewTask = saveNewTask;
window.openAddMenu = openAddMenu;

window.openSettings = function() {
    document.getElementById('app-content').innerHTML = `
        <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--bg3); padding-bottom: 10px;">
                <span>Версия приложения</span>
                <span style="color: var(--fg-dim);">7.1</span>
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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initFloatingMenu(), 100);
    window.renderMainMenu();
    initAudioButton();
});
window.openCalendar = renderCalendar;
window.openDiary = renderDiary;
window.setNavActive = setNavActive;
window.setNavActive = setNavActive;

window.openMenu = function() {
    const container = document.getElementById('app-content');
    
    let html = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <button onclick="window.renderMainMenu()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад</button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Меню</h2>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div onclick="window.showStub('KPI', 'kpi')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📊</span>
                    <span style="color: var(--fg);">KPI</span>
                </div>
                <div onclick="window.showStub('CRM', 'crm')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">👥</span>
                    <span style="color: var(--fg);">CRM</span>
                </div>
                <div onclick="window.showStub('Финансы', 'finance')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">💵</span>
                    <span style="color: var(--fg);">Финансы</span>
                </div>
                <div onclick="window.showStub('Отчёты', 'reports')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📄</span>
                    <span style="color: var(--fg);">Отчёты</span>
                </div>
                <div onclick="window.showStub('Личные', 'personal')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">👤</span>
                    <span style="color: var(--fg);">Личные</span>
                </div>
                <div onclick="window.showStub('Диктофон', 'dictaphone')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🎤</span>
                    <span style="color: var(--fg);">Диктофон</span>
                </div>
                <div onclick="window.showStub('Блокнот', 'notepad')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📝</span>
                    <span style="color: var(--fg);">Блокнот</span>
                </div>
                <div onclick="window.showStub('Документы', 'documents')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📁</span>
                    <span style="color: var(--fg);">Документы</span>
                </div>
                <div onclick="window.showStub('Материалы', 'materials')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📦</span>
                    <span style="color: var(--fg);">Материалы</span>
                </div>
                <div onclick="window.showStub('Комплектация', 'equipment')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🧰</span>
                    <span style="color: var(--fg);">Комплектация</span>
                </div>
                <div onclick="window.showStub('Работы', 'works')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🔨</span>
                    <span style="color: var(--fg);">Работы</span>
                </div>
                <div onclick="window.showStub('Маркетинг', 'marketing')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📢</span>
                    <span style="color: var(--fg);">Маркетинг</span>
                </div>
                <div onclick="window.showStub('Персонал', 'personnel')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">👥</span>
                    <span style="color: var(--fg);">Персонал</span>
                </div>
                <div onclick="window.showStub('База знаний', 'knowledge')" style="background: var(--bg2); padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">📚</span>
                    <span style="color: var(--fg);">База знаний</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
};
