// Логика для Бо 8.1 Web App
// ВАЖНО: Твой URL Replit. Замени его, если он изменится.
const API_URL = 'https://9b7b76e6-2a55-4066-aec3-8b9aabd72cfa-00-3tkkz4oxoetcb.pike.replit.dev';

// Главное меню (как в боте)
function renderMainMenu() {
    const menuItems = [
        { icon: '🏗', title: 'Объекты', action: 'openObjects()' },
        { icon: '📋', title: 'Задачи', action: 'alert("В разработке")' },
        { icon: '💰', title: 'Финансы', action: 'alert("В разработке")' },
        { icon: '📊', title: 'Сметы', action: 'alert("В разработке")' },
        { icon: '📈', title: 'Отчёты', action: 'alert("В разработке")' },
        { icon: '📊', title: 'KPI', action: 'alert("В разработке")' },
        { icon: '💸', title: 'Личные', action: 'alert("В разработке")' },
        { icon: '👥', title: 'CRM', action: 'alert("В разработке")' },
        { icon: '🌐', title: 'Дашборд', action: 'alert("Дашборд скоро")' },
        { icon: '➕', title: 'Добавить', action: 'alert("Добавление")' },
        { icon: '⚙️', title: 'Помощь', action: 'alert("Помощь")' }
    ];

    let html = '<div class="header"><h2>Бо 8.1</h2></div><div class="menu-grid">';
    menuItems.forEach(item => {
        html += `
            <div class="menu-item" onclick="${item.action}">
                <div class="menu-icon">${item.icon}</div>
                <div class="menu-title">${item.title}</div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('app-content').innerHTML = html;
}

// Экран списка объектов (с загрузкой из API)
async function openObjects() {
    document.getElementById('app-content').innerHTML = '<div class="loading">Загрузка объектов...</div>';
    
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
            // Определяем цвет статуса
            let statusColor = obj.status === 'active' ? 'var(--accent)' : (obj.status === 'completed' ? 'var(--green)' : 'var(--fg-dim)');
            let statusText = obj.status === 'active' ? 'В работе' : (obj.status === 'completed' ? 'Завершен' : obj.status);

            html += `
                <div class="object-card" onclick="openObject(${obj.id})">
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

    } catch (error) {
        document.getElementById('app-content').innerHTML = `
            <div class="header">
                <button class="back-btn" onclick="renderMainMenu()">← Назад</button>
                <h2>Ошибка</h2>
            </div>
            <div class="error">Не удалось загрузить объекты: ${error.message}</div>
        `;
    }
}

// Экран внутри объекта (пока заглушка)
function openObject(id) {
    let html = `
        <div class="header">
            <button class="back-btn" onclick="openObjects()">← Назад</button>
            <h2>Объект #${id}</h2>
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

document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
});
