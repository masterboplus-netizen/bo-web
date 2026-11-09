import { renderDiary } from './screens/diary.js';
import './modals/diary_edit.js';
import { renderNotepad } from './screens/notepad.js';
import { renderFinance } from './screens/finance.js';
import { renderCashFlow } from './screens/cashflow.js';
import './modals/finance_operation.js';
import { openMenu } from './screens/menu.js';
import { showStub } from './ui/stub.js';
import { showConfirm } from './ui/confirm.js';
import { openSettings, openMenuSettings, openWidgetSettings } from './screens/settings.js';
import { renderCalendar } from './screens/calendar.js';
import { renderPhotos } from './screens/photos.js';
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

import './modals/task_field_edit.js';
import './ui/calendar_modal.js';
import './modals/photo_title.js';
import './modals/photo_upload.js';
import './screens/task_gallery.js';



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
window.openPhotos = function() { saveCurrentScreen('photos'); renderPhotos(); };
window.openDiary = function() { saveCurrentScreen('diary'); renderDiary(); };
window.openNotepad = function() { saveCurrentScreen('notepad'); renderNotepad(); };
window.saveCurrentScreen = saveCurrentScreen;
window.openFinance = function() { saveCurrentScreen('finance'); renderFinance(); };
window.setNavActive = setNavActive;
window.setNavActive = setNavActive;
















// При загрузке страницы проверяем сохраненную вкладку и открываем её

// Восстанавливаем последнюю открытую вкладку при загрузке

