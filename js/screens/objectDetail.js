import { fetchObject, updateObject, deleteObject } from '../api/objects.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// === ПРОСМОТР ОБЪЕКТА ===
export async function openObject(objectId) {
    try {
        const obj = await fetchObject(objectId);
        if (!obj) throw new Error('Объект не найден');

        let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
        let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
        let address = obj.address || obj.addres || 'Адрес не указан';
        let yandexLink = 'https://yandex.ru/maps/?text=' + encodeURIComponent(address);
        let gisLink = 'https://2gis.ru/search/' + encodeURIComponent(address);

        let html = `
            <div style="padding-top: 10px; max-width: 600px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button onclick="window.openObjects()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button onclick="window.openObjectActions(${obj.id}, '${escapeHtml(obj.name)}')" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>

                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 22px; color: var(--fg);">${escapeHtml(obj.name)}</h2>
                        <span class="badge" style="background: ${statusColor}; margin-top: 8px; display: inline-block;">${statusText}</span>
                    </div>
                    
                    <div style="color: var(--fg-dim); font-size: 14px; margin-bottom: 15px;">${escapeHtml(address)}</div>
                    
                    <div style="display: flex; gap: 8px; margin-bottom: 20px;">
                        <a href="${yandexLink}" target="_blank" style="flex: 1; text-align: center; padding: 10px; background: var(--bg3); border-radius: 10px; color: var(--fg); text-decoration: none; font-size: 13px;">Яндекс</a>
                        <a href="${gisLink}" target="_blank" style="flex: 1; text-align: center; padding: 10px; background: var(--bg3); border-radius: 10px; color: var(--fg); text-decoration: none; font-size: 13px;">2ГИС</a>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg3); padding-top: 15px;">
                        <span style="color: var(--fg-dim);">Бюджет</span>
                        <span style="font-size: 18px; font-weight: bold; color: var(--fg);">${obj.budget || 0} ₽</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('app-content').innerHTML = html;
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
}

// === МЕНЮ ДЕЙСТВИЙ (ТРИ ТОЧКИ) ===
window.openObjectActions = function(id, name) {
    // Удаляем старое меню, если есть
    const oldMenu = document.getElementById('obj-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'obj-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';
    
    menu.innerHTML = `
        <div onclick="window.openEditObject(${id})" style="padding: 14px 16px; color: var(--fg); font-size: 15px; cursor: pointer; border-bottom: 1px solid var(--bg3);">Редактировать</div>
        <div onclick="window.deleteObjectById(${id})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;
    
    document.body.appendChild(menu);

    // Закрытие по клику вне меню
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="openObjectActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};

// === РЕДАКТИРОВАНИЕ (ШТОРКА) ===
window.openEditObject = async function(id) {
    try {
        const obj = await fetchObject(id);
        if (!obj) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99998; opacity: 0; transition: opacity 0.3s ease;';
        
        const sheet = document.createElement('div');
        sheet.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg2); border-radius: 24px 24px 0 0; z-index: 99999; padding: 24px 16px 32px 16px; box-sizing: border-box; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--border); max-width: 600px; margin: 0 auto;';
        
        sheet.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: var(--fg);">Редактировать объект</h3>
                <button id="close-edit-obj" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div>
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Название</label>
                <input type="text" id="edit-obj-name" value="${escapeHtml(obj.name)}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
            </div>

            <div>
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Адрес</label>
                <input type="text" id="edit-obj-address" value="${escapeHtml(obj.address || '')}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>

            <div>
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Бюджет (₽)</label>
                <input type="number" id="edit-obj-budget" value="${obj.budget || 0}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>

            <button onclick="window.saveObjectChanges(${id})" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(sheet);

        setTimeout(() => {
            overlay.style.opacity = '1';
            sheet.style.transform = 'translateY(0)';
        }, 10);

        function closeEdit() {
            overlay.style.opacity = '0';
            sheet.style.transform = 'translateY(100%)';
            setTimeout(() => {
                overlay.remove();
                sheet.remove();
            }, 300);
        }

        overlay.onclick = closeEdit;
        document.getElementById('close-edit-obj').onclick = closeEdit;

    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

// === СОХРАНЕНИЕ ===
window.saveObjectChanges = async function(id) {
    const name = document.getElementById('edit-obj-name').value.trim();
    const address = document.getElementById('edit-obj-address').value.trim();
    const budget = document.getElementById('edit-obj-budget').value;

    if (!name) return alert('Название не может быть пустым!');

    try {
        await updateObject(id, name, address, budget);
        window.openObject(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

// === УДАЛЕНИЕ ===
window.deleteObjectById = async function(id) {
    if (!confirm('Удалить этот объект? Все его данные будут потеряны.')) return;
    try {
        await deleteObject(id);
        window.openObjects();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};

window.openObject = openObject;
