import { renderDiary } from './screens/diary.js';
import { renderNotepad } from './screens/notepad.js';
import { renderFinance } from './screens/finance.js';
import { openMenu } from './screens/menu.js';
import { openSettings, openMenuSettings, openWidgetSettings } from './screens/settings.js';
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
