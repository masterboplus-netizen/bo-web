function openObject(obj) {
    CURRENT_OBJECT = obj;
    let statusText = obj.status === 'active' ? 'В работе' : (obj.status === 'completed' ? 'Завершен' : obj.status);
    let html = `
        <div class="header">
            <button class="back-btn" onclick="openObjects()">← Назад</button>
            <h2>${obj.name}</h2>
        </div>
        <div class="object-info" style="margin-bottom: 20px; color: var(--fg-dim);">
            <div>Статус: ${statusText}</div>
            <div>Баланс: ${obj.balance} ₽</div>
        </div>
        <div class="menu-grid">
            <div class="menu-item">🏠 Комнаты</div>
            <div class="menu-item">⚡ Электрика</div>
            <div class="menu-item">🚰 Сантехника</div>
            <div class="menu-item">💰 Финансы</div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}
