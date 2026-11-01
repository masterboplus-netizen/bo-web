window.onerror = function(msg, url, line) {
  document.body.innerHTML += '<div style="position:fixed; bottom:10px; left:10px; right:10px; background:red; color:white; padding:10px; z-index:999999; font-size:12px;">ОШИБКА: ' + msg + ' (строка ' + line + ')</div>';
};

import { renderObjects } from './screens/objects.js';
import { openObject } from './screens/objectDetail.js';
import { openEditObject, saveObjectEdit } from './screens/objectEdit.js';
import { initFloatingMenu } from './ui/floating_menu.js';
import { fetchObjects } from './api/objects.js';
import { openAddMenu, openAddObject, saveNewObject } from './modals/add_menu.js';

window.renderMainMenu = function() {
    document.getElementById('app-content').innerHTML = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в MasterBoss!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    setNavActive('main');
};

window.openObjects = async function() {
    // Загрузка убрана
    try {
        const objects = await fetchObjects();
        renderObjects(objects);
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
    setNavActive('objects');
};

window.openObject = openObject;
window.openEditObject = openEditObject;
window.saveObjectEdit = saveObjectEdit;
window.openAddMenu = openAddMenu;
window.openAddObject = openAddObject;
window.saveNewObject = saveNewObject;

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
            <div style="font-size: 50px; margin-bottom: 20px;">🚧</div>
            <h3>${title}</h3>
            <p>Раздел в разработке.</p>
        </div>`;
    if (tabId) setNavActive(tabId);
};

export function setNavActive(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('nav-' + tabId);
    if (el) el.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    initFloatingMenu();
    window.renderMainMenu();
});


window.showToast = function(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; z-index: 999999; border: 1px solid rgba(255,255,255,0.2); transition: opacity 0.3s;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
};
