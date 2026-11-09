import { fetchObject, updateObject, deleteObject } from '../api/objects.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openEditObject(id) {
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
}

export async function saveObjectChanges(id) {
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
}

export async function deleteObjectById(id) {
    window.showConfirm('Вы уверены, что хотите удалить этот объект?', async () => {
        try {
            await deleteObject(id);
            window.openObjects();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
}

export async function openEditAddress(id) {
    try {
        const obj = await fetchObject(id);
        if (!obj) throw new Error('Объект не найден');

        const overlay = document.createElement('div');
        overlay.id = 'address-modal-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

        const modal = document.createElement('div');
        modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; max-height: 80vh; overflow-y: auto; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box;';

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
                <input type="text" id="addr-house" placeholder="Дом" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <input type="text" id="addr-block" placeholder="Корпус" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <input type="text" id="addr-entrance" placeholder="Подъезд" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <input type="text" id="addr-floor" placeholder="Этаж" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                <input type="text" id="addr-flat" placeholder="Кв" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>

            <div style="display: flex; gap: 10px;">
                <button id="save-address-btn" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer;">Сохранить</button>
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
        document.getElementById('save-address-btn').onclick = () => window.saveAddress(id);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    } catch (err) {
        alert('Ошибка загрузки объекта: ' + err.message);
    }
}

export async function saveAddress(id) {
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
}

window.openEditObject = openEditObject;
window.saveObjectChanges = saveObjectChanges;
window.deleteObjectById = deleteObjectById;
window.openEditAddress = openEditAddress;
window.saveAddress = saveAddress;
