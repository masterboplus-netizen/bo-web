// Логика для Бо 8.1 Web App

const mockData = {
    objects: [
        { id: 1, name: 'Квартира на Ленина', status: 'В работе', budget: '1 500 000' },
        { id: 2, name: 'Офис в центре', status: 'Замеры', budget: '3 200 000' }
    ]
};

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

// Экран списка объектов
function openObjects() {
    let html = `
        <div class="header">
            <button class="back-btn" onclick="renderMainMenu()">← Назад</button>
            <h2>Объекты</h2>
        </div>
        <div class="object-list">
    `;
    mockData.objects.forEach(obj => {
        html += `
            <div class="object-card" onclick="openObject(${obj.id})">
                <div class="obj-title">${obj.name}</div>
                <div class="obj-details">
                    <span class="badge">${obj.status}</span>
                    <span class="budget">${obj.budget} ₽</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('app-content').innerHTML = html;
}

// Экран внутри объекта
function openObject(id) {
    const obj = mockData.objects.find(o => o.id === id);
    let html = `
        <div class="header">
            <button class="back-btn" onclick="openObjects()">← Назад</button>
            <h2>${obj.name}</h2>
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
