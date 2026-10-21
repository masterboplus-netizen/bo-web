// Логика для Бо 8.1 Web App (Заглушка с данными из базы)

const MOCK_OBJECTS = [
    { id: 27, name: "Рароа", status: "active", balance: 0 },
    { id: 26, name: "Арбат", status: "active", balance: 106618 },
    { id: 25, name: "Барклая", status: "active", balance: -450 },
    { id: 24, name: "Вавилова", status: "completed", balance: 0 },
    { id: 23, name: "Объект на Ленина", status: "active", balance: 50000 }
];

function renderMainMenu() {
    let html = `
        <div class="header"><h2>Бо 8.1</h2></div>
        <div class="main-action" onclick="openObjects()">
            <div class="main-action-title">Перейти к объектам</div>
            <div class="main-action-desc">Список всех ваших проектов</div>
        </div>
        <div class="quick-grid">
            <div class="quick-item" onclick="alert('В разработке')"><div class="q-icon">📋</div><div class="q-title">Задачи</div></div>
            <div class="quick-item" onclick="alert('В разработке')"><div class="q-icon">💰</div><div class="q-title">Финансы</div></div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

function openObjects() {
    let html = `
        <div class="header">
            <button class="back-btn" onclick="renderMainMenu()">← Назад</button>
            <h2>Объекты</h2>
        </div>
        <div class="object-list">
    `;
    MOCK_OBJECTS.forEach(obj => {
        let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
        let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
        html += `
            <div class="object-card" onclick='openObject(${JSON.stringify(obj)})'>
                <div class="obj-title">${obj.name}</div>
                <div class="obj-details">
                    <span class="badge" style="background: ${statusColor}">${statusText}</span>
                    <span class="budget">${obj.balance} ₽</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('app-content').innerHTML = html;
}

function openObject(obj) {
    let html = `
        <div class="header">
            <button class="back-btn" onclick="openObjects()">← Назад</button>
            <h2>${obj.name}</h2>
        </div>
        <div style="margin-bottom: 20px; color: var(--fg-dim);">
            <div>Статус: ${obj.status === 'active' ? 'В работе' : 'Завершен'}</div>
            <div>Баланс: ${obj.balance} ₽</div>
        </div>
        <div class="menu-grid">
            <div class="menu-item" onclick="openRooms(CURRENT_OBJECT.id)">🏠 Комнаты</div>
            <div class="menu-item" onclick="alert('В разработке')">⚡ Электрика</div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => { renderMainMenu(); });

function openRooms(objectId) {
    document.getElementById('app-content').innerHTML = `
        <div class="header">
            <button class="back-btn" onclick="openObject(CURRENT_OBJECT)">← Назад</button>
            <h2>Комнаты</h2>
        </div>
        <div id="rooms-list">Загрузка...</div>
    `;
    fetch(`https://bo-api.onrender.com/api/objects/${objectId}/rooms`)
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById('rooms-list');
            if (data.status === 'ok' && data.rooms.length > 0) {
                el.innerHTML = data.rooms.map(r => `
                    <div class="object-card" style="margin-bottom: 10px;">
                        <div class="obj-title">${r.name}</div>
                        <div class="obj-details">
                            <span class="badge" style="background: var(--accent);">${r.room_type || 'Комната'}</span>
                            <span class="budget">S: ${r.area_sqm || 0} м²</span>
                        </div>
                    </div>
                `).join('');
            } else {
                el.innerHTML = '<p style="color:var(--fg-dim);">Комнат пока нет или ошибка загрузки.</p>';
            }
        })
        .catch(e => {
            document.getElementById('rooms-list').innerHTML = `<p style="color:var(--red);">Ошибка API: ${e.message}</p>`;
        });
}
