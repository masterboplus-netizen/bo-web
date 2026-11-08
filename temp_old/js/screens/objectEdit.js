import { fetchObject, updateObject } from '../api/objects.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openEditObject(objectId) {
    try {
        const obj = await fetchObject(objectId);
        if (!obj) throw new Error('Объект не найден');

        let html = `
            <div style="padding-top: 10px;">
                <div style="margin-bottom: 25px;">
                    <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Название объекта</label>
                    <input type="text" id="edit-obj-name" value="${escapeHtml(obj.name)}" style="width: 100%; box-sizing: border-box; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;">
                </div>
                <div style="margin-bottom: 25px;">
                    <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Адрес</label>
                    <input type="text" id="edit-obj-address" value="${escapeHtml(obj.address || '')}" style="width: 100%; box-sizing: border-box; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;">
                </div>
                <div style="margin-bottom: 25px;">
                    <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Бюджет (₽)</label>
                    <input type="number" id="edit-obj-budget" value="${obj.budget || 0}" style="width: 100%; box-sizing: border-box; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;">
                </div>
                <button onclick="window.saveObjectEdit(${obj.id})" style="width: 100%; padding: 18px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить изменения</button>
                <button onclick="window.openObject(${obj.id})" style="width: 100%; padding: 15px; background: none; color: var(--fg-dim); border: none; font-size: 14px; cursor: pointer; margin-top: 10px;">Отмена</button>
            </div>
        `;
        document.getElementById('app-content').innerHTML = html;
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
}

export async function saveObjectEdit(objectId) {
    let name = document.getElementById('edit-obj-name').value;
    let address = document.getElementById('edit-obj-address').value;
    let budget = document.getElementById('edit-obj-budget').value;

    if (!name) { document.getElementById('edit-obj-name').focus(); return; }

    try {
        await updateObject(objectId, name, address, budget);
        window.openObject(objectId);
    } catch (e) {
        alert('Ошибка: ' + e.message);
    }
}
