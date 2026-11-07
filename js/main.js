import { renderDiary } from './screens/diary.js';
import { renderNotepad } from './screens/notepad.js';
import { renderFinance } from './screens/finance.js';
import { openMenu } from './screens/menu.js';
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
