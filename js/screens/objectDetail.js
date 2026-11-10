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
            <div style="padding: 0 10px 20px 10px; max-width: 100%; margin: 0 auto;">
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

                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; margin-bottom: 20px; width: 100%; box-sizing: border-box; border: 1px solid var(--bg3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    <div style="margin-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 22px; color: var(--fg);">${escapeHtml(obj.name)}</h2>
                        <span class="badge" style="background: ${statusColor}; margin-top: 8px; display: inline-block;">${statusText}</span>
                    </div>
                    
                    <div onclick="window.openObjectEdit(obj)" style="color: var(--fg-dim); font-size: 14px; margin-bottom: 15px; cursor: pointer; text-decoration: underline;">${escapeHtml(address)}</div>
                    
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
    const oldMenu = document.getElementById('obj-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'obj-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';
    
    menu.innerHTML = `
        <div onclick="this.parentElement.remove(); window.openEditObject(${id})" style="padding: 14px 16px; color: var(--fg); font-size: 15px; cursor: pointer; border-bottom: 1px solid var(--bg3);">Редактировать</div>
        <div onclick="window.deleteObjectById(${id})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;
    
    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="openObjectActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};

