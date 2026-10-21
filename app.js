// Логика для Бо 8.1 Web App
// Автоматически определяем API_URL
let API_URL = '';
if (window.location.hostname.includes('replit')) {
    API_URL = window.location.origin; // Если открыто в Replit
} else {
    // Если открыто на GitHub, берем последний известный
    API_URL = localStorage.getItem('bo_api_url') || 'https://9b7b76e6-2a55-4066-aec3-8b9aabd72cfa-00-3tkkz4oxoetcb.pike.replit.dev';
}

// Умный главный экран
function renderMainMenu() {
    let html = `
        <div class="header"><h2>Бо 8.1</h2></div>
        
        <div class="main-action" onclick="openObjects()">
            <div class="main-action-title">Перейти к объектам</div>
            <div class="main-action-desc">Список всех ваших проектов</div>
        </div>

        <div class="quick-grid">
            <div class="quick-item" onclick="alert('В разработке')">
                <div class="q-icon">📋</div>
                <div class="q-title">Задачи</div>
            </div>
            <div class="quick-item" onclick="alert('В разработке')">
                <div class="q-icon">💰</div>
                <div class="q-title">Финансы</div>
            </div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

// Экран списка объектов
async function openObjects() {
    document.getElementById('app-content').innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await fetch(API_URL + '/api/objects');
        if (!response.ok) throw new Error('Ошибка сети');
        const objects = await response.json();

        let html = `
            <div class="header">
                <button class="back-btn" onclick="renderMainMenu()">← Назад</button>
                <h2>Объекты</h2>
            </div>
            <div class="object-list">
        `;
        
        objects.forEach(obj => {
            let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
            html += `
                <div class="object-card" onclick='openObject(${JSON.stringify(obj)})'>
                    <div class="obj-title">${obj.name}</div>
                    <div class="obj-details">
                        <span class="badge" style="background: ${statusColor}">${obj.status === 'active' ? 'В работе' : 'Завершен'}</span>
                        <span class="budget">${obj.balance} ₽</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        document.getElementById('app-content').innerHTML = html;

    } catch (error) {
        document.getElementById('app-content').innerHTML = `
            <div class="header"><button class="back-btn" onclick="renderMainMenu()">← Назад</button><h2>Ошибка</h2></div>
            <div style="color:red">${error.message}</div>
        `;
    }
}

// Экран внутри объекта
function openObject(obj) {
    let html = `
        <div class="header">
            <button class="back-btn" onclick="openObjects()">← Назад</button>
            <h2>${obj.name}</h2>
        </div>
        <div style="margin-bottom: 20px; color: var(--fg-dim);">
            <div>Статус: ${obj.status}</div>
            <div>Баланс: ${obj.balance} ₽</div>
        </div>
        <div class="menu-grid">
            <div class="menu-item">🏠 Комнаты</div>
            <div class="menu-item">⚡ Электрика</div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => { renderMainMenu(); });
