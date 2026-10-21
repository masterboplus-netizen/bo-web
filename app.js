// Логика для Бо 8.1 Web App
const mockData = {
    objects: [
        { id: 1, name: 'Квартира на Ленина', status: 'В работе', budget: '1 500 000' },
        { id: 2, name: 'Офис в центре', status: 'Замеры', budget: '3 200 000' }
    ]
};

function renderObjects() {
    let html = '<div class="header"><h2>Мои объекты</h2></div><div class="object-list">';
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
    return html;
}

function openObject(id) {
    const obj = mockData.objects.find(o => o.id === id);
    let html = `
        <div class="header">
            <button class="back-btn" onclick="goHome()">← Назад</button>
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

function goHome() {
    document.getElementById('app-content').innerHTML = renderObjects();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('app-content').innerHTML = renderObjects();
});
