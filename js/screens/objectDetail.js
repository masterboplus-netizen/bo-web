import { fetchObject, updateObject, deleteObject } from '../api/objects.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openObject(objectId) {
    try {
        const obj = await fetchObject(objectId);
        if (!obj) throw new Error('Объект не найден');

        let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
        let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
        let address = obj.address || obj.addres || '';

        let html = `
            <div style="padding-top: 10px; max-width: 600px; margin: 0 auto;">
                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 20px; color: var(--fg);">Редактирование объекта</h2>
                        <button onclick="window.deleteObjectById(${obj.id})" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; padding: 5px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Название</label>
                        <input type="text" id="edit-obj-name" value="${escapeHtml(obj.name)}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Адрес</label>
                        <input type="text" id="edit-obj-address" value="${escapeHtml(address)}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Бюджет (₽)</label>
                        <input type="number" id="edit-obj-budget" value="${obj.budget || 0}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 20px;">
                        <a href="https://yandex.ru/maps/?text=${encodeURIComponent(address)}" target="_blank" style="flex: 1; text-align: center; padding: 10px; background: var(--bg3); border-radius: 10px; color: var(--fg); text-decoration: none; font-size: 13px;">Яндекс</a>
                        <a href="https://2gis.ru/search/${encodeURIComponent(address)}" target="_blank" style="flex: 1; text-align: center; padding: 10px; background: var(--bg3); border-radius: 10px; color: var(--fg); text-decoration: none; font-size: 13px;">2ГИС</a>
                    </div>
                </div>

                <button onclick="window.saveObjectChanges(${obj.id})" style="width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">Сохранить</button>
                <button onclick="window.openObjects()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
            </div>
        `;
        document.getElementById('app-content').innerHTML = html;
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
}

window.saveObjectChanges = async function(id) {
    const name = document.getElementById('edit-obj-name').value.trim();
    const address = document.getElementById('edit-obj-address').value.trim();
    const budget = document.getElementById('edit-obj-budget').value;

    if (!name) return alert('Название не может быть пустым!');

    try {
        await updateObject(id, name, address, budget);
        alert('Объект сохранен!');
        window.openObject(id); // Перезагружаем карточку
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

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
