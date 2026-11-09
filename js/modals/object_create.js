import { createObject } from '../api/objects.js';

export function openNewObject() {
    const container = document.getElementById('app-content');
    container.innerHTML = `
        <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
            <button onclick="window.openObjects()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Новый объект</h2>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название *</label>
                    <input type="text" id="new-obj-name" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;" placeholder="Название объекта">
                </div>

                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Адрес</label>
                    <input type="text" id="new-obj-address" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;" placeholder="Город, улица, дом">
                </div>

                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Бюджет (₽)</label>
                    <input type="number" id="new-obj-budget" value="0" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                </div>

                <button onclick="window.saveNewObject()" style="width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
                <button onclick="window.openObjects()" style="width: 100%; padding: 14px; background: transparent; color: var(--fg-dim); border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">Отмена</button>
            </div>
        </div>
    `;
}

export async function saveNewObject() {
    const name = document.getElementById('new-obj-name').value.trim();
    const address = document.getElementById('new-obj-address').value.trim();
    const budget = document.getElementById('new-obj-budget').value;

    if (!name) return alert('Введите название объекта!');

    try {
        await createObject(name, address, budget);
        window.openObjects();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
}

window.openNewObject = openNewObject;
window.saveNewObject = saveNewObject;
