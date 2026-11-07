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
                    
                    <div onclick="window.openEditAddress(${obj.id})" style="color: var(--fg-dim); font-size: 14px; margin-bottom: 15px; cursor: pointer;">${escapeHtml(address)}</div>
                    
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
        <div onclick="this.parentElement.remove(); window.openEditObject(${id})" style="padding: 14px 16px; color: var(--fg); font-size: 15px; cursor: pointer; border-bottom: 1px solid var(--bg3);">Редактировать</div>
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

// === РЕДАКТИРОВАНИЕ (ОТДЕЛЬНЫЙ ЭКРАН) ===
window.openEditObject = async function(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const obj = await fetchObject(id);
        if (!obj) throw new Error('Объект не найден');

        container.innerHTML = `
            <div style="padding: 0 10px 20px 10px; max-width: 100%; margin: 0 auto; padding-bottom: 100px;">
                <button onclick="window.openObject(${id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название</label>
                        <input type="text" id="edit-obj-name" value="${escapeHtml(obj.name)}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Адрес</label>
                        <input type="text" id="edit-obj-address" value="${escapeHtml(obj.address || '')}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Бюджет (₽)</label>
                        <input type="number" id="edit-obj-budget" value="${obj.budget || 0}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>
                    <button onclick="window.saveObjectChanges(${id})" style="width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
                </div>
            </div>
        `;
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
    window.showConfirm('Вы уверены, что хотите удалить этот объект?', async () => {
        try {
            await deleteObject(id);
            window.openObjects();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

window.openObject = openObject;


// === МОДАЛКА РЕДАКТИРОВАНИЯ АДРЕСА ===
window.openEditAddress = async function(id) {
    try {
        const obj = await fetchObject(id);
        if (!obj) throw new Error('Объект не найден');

        const overlay = document.createElement('div');
        overlay.id = 'address-modal-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.2s ease;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 16px; max-width: 340px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease; max-height: 500px; overflow-y: auto;';

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--fg); font-size: 16px;">Редактировать адрес</h3>
                <button id="close-address" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="addr-city" placeholder="Город" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <input type="text" id="addr-street" placeholder="Улица" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="addr-house" placeholder="Дом" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <input type="text" id="addr-block" placeholder="Корпус" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="addr-entrance" placeholder="Подъезд" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <input type="text" id="addr-floor" placeholder="Этаж" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <input type="text" id="addr-flat" placeholder="Кв" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                </div>
            </div>

            <div style="display: flex; gap: 10px;">
                <button onclick="window.saveAddress(${id})" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer;">Сохранить</button>
                <button id="cancel-address" style="flex: 1; padding: 12px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer;">Отмена</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);

        document.getElementById('close-address').onclick = () => overlay.remove();
        document.getElementById('cancel-address').onclick = () => overlay.remove();
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    } catch (err) {
        alert('Ошибка загрузки объекта: ' + err.message);
    }
};

// === СОХРАНЕНИЕ АДРЕСА ===
window.saveAddress = async function(id) {
    const city = document.getElementById('addr-city').value.trim();
    const street = document.getElementById('addr-street').value.trim();
    const house = document.getElementById('addr-house').value.trim();
    const block = document.getElementById('addr-block').value.trim();
    const entrance = document.getElementById('addr-entrance').value.trim();
    const floor = document.getElementById('addr-floor').value.trim();
    const flat = document.getElementById('addr-flat').value.trim();

    let parts = [];
    if (city) parts.push(city);
    if (street) parts.push(street);
    if (house) parts.push('д. ' + house);
    if (block) parts.push('корп. ' + block);
    if (entrance) parts.push('подъезд ' + entrance);
    if (floor) parts.push('этаж ' + floor);
    if (flat) parts.push('кв. ' + flat);

    const finalAddress = parts.join(', ');

    try {
        const obj = await fetchObject(id);
        await updateObject(id, obj.name, finalAddress, obj.budget);
        
        const overlay = document.getElementById('address-modal-overlay');
        if (overlay) overlay.remove();
        
        window.openObject(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};
