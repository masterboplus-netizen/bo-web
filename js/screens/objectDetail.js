import { fetchObject } from '../api/objects.js';

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
        let address = obj.address || 'Адрес не указан';
        let yandexLink = 'https://yandex.ru/maps/?text=' + encodeURIComponent(address);
        let gisLink = 'https://2gis.ru/search/' + encodeURIComponent(address);

        let html = `
            <div style="padding-top: 10px;">
                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div>
                            <h2 style="margin: 0; font-size: 22px; color: var(--fg);">${escapeHtml(obj.name)}</h2>
                            <span class="badge" style="background: ${statusColor}; margin-top: 8px; display: inline-block;">${statusText}</span>
                        </div>
                        <button onclick="window.openEditObject(${obj.id})" style="background: var(--bg3); border: none; border-radius: 8px; padding: 10px; cursor: pointer; color: var(--fg);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
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
                <button onclick="window.openObjects()" style="width: 100%; padding: 15px; background: none; color: var(--fg-dim); border: none; font-size: 14px; cursor: pointer;">← Назад к списку</button>
            </div>
        `;
        document.getElementById('app-content').innerHTML = html;
    } catch (e) {
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${e.message}</div>`;
    }
}
