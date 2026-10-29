const MOCK_OBJECTS = [
    { id: 27, name: "Рароа", status: "active", balance: 0 },
    { id: 26, name: "Арбат", status: "active", balance: 106618 },
    { id: 25, name: "Барклая", status: "active", balance: -450 },
    { id: 24, name: "Вавилова", status: "completed", balance: 0 },
    { id: 23, name: "Объект на Ленина", status: "active", balance: 50000 }
];

let CURRENT_OBJECT = null;

function getHeader() {
    return `
    <div class="header" style="justify-content: space-between; margin-bottom: 20px; display: flex; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="icon-192.png" style="width: 36px; height: 36px; border-radius: 8px;">
            <h2 style="margin: 0; font-size: 22px;">Master Bo 7.1</h2>
        </div>
        <button class="back-btn" onclick="openSettings()" style="font-size: 24px; padding: 5px; color: var(--fg); cursor: pointer; background: none; border: none;">
            ⚙️
        </button>
    </div>`;
}

function renderMainMenu() {
    CURRENT_OBJECT = null;
    let html = `
        <div style="margin-bottom: 20px;">
            <div class="menu-item" onclick="openObjects()" style="background: var(--accent); color: white; border: none; padding: 25px 20px; font-size: 18px; font-weight: bold;">
                🏗 Объекты
                <div style="font-size: 12px; font-weight: normal; opacity: 0.8; margin-top: 5px;">Список всех ваших проектов</div>
            </div>
        </div>
        <div class="menu-grid">
            <div class="menu-item" onclick="showStub('📋 Задачи')">📋 Задачи</div>
            <div class="menu-item" onclick="showStub('💰 Финансы')">💰 Финансы</div>
            <div class="menu-item" onclick="showStub('📊 Сметы')">📊 Сметы</div>
            <div class="menu-item" onclick="showStub('📈 Отчёты')">📈 Отчёты</div>
            <div class="menu-item" onclick="showStub('📊 KPI')">📊 KPI</div>
            <div class="menu-item" onclick="showStub('💸 Личные')">💸 Личные</div>
            <div class="menu-item" onclick="showStub('👥 CRM')">👥 CRM</div>
            <div class="menu-item" onclick="openAddObject()">➕ Добавить</div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}

function openObjects() {
    let saved = localStorage.getItem('bo_objects');
    let objects = saved ? JSON.parse(saved) : [...MOCK_OBJECTS];
    let html = `<div class="object-list">`;
    objects.forEach(obj => {
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
    html += `</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('objects');
}

function openObject(obj) {
    CURRENT_OBJECT = obj;
    let html = `
        <div style="margin-bottom: 20px; color: var(--fg-dim); background: var(--bg2); padding: 15px; border-radius: 12px;">
            <div style="font-size: 20px; font-weight: bold; color: var(--fg); margin-bottom: 10px;">${obj.name}</div>
            <div>Статус: <span style="color: ${obj.status === 'active' ? 'var(--accent)' : '#fff'}">${obj.status === 'active' ? 'В работе' : 'Завершен'}</span></div>
            <div>Баланс: ${obj.balance} ₽</div>
        </div>
        <div class="menu-grid">
            <div class="menu-item" onclick="showStub('🏠 Комнаты: ${obj.name}')">🏠 Комнаты</div>
            <div class="menu-item" onclick="showStub('⚡ Электрика')">⚡ Электрика</div>
            <div class="menu-item" onclick="showStub('📋 Задачи объекта')">📋 Задачи</div>
            <div class="menu-item" onclick="showStub('💰 Финансы объекта')">💰 Финансы</div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('objects');
}

function openAddObject() {
    let html = `
        <div style="background: var(--bg2); padding: 20px; border-radius: 12px;">
            <label style="display:block; margin-bottom: 10px;">Название объекта</label>
            <input type="text" id="new-obj-name" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 20px;" placeholder="Например: Квартира на Ленина">
            <label style="display:block; margin-bottom: 10px;">Бюджет (₽)</label>
            <input type="number" id="new-obj-budget" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 20px;" placeholder="0">
            <button onclick="saveObject()" style="width: 100%; padding: 15px; background: var(--accent); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить объект</button>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

function saveObject() {
    let name = document.getElementById('new-obj-name').value;
    let budget = document.getElementById('new-obj-budget').value;
    if (!name) { alert('Введите название!'); return; }
    let saved = localStorage.getItem('bo_objects');
    let objects = saved ? JSON.parse(saved) : [...MOCK_OBJECTS];
    objects.unshift({ id: Date.now(), name: name, status: "active", balance: Number(budget) || 0 });
    localStorage.setItem('bo_objects', JSON.stringify(objects));
    alert('Объект создан!');
    openObjects();
}

function showStub(title) {
    let html = `
        <div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
            <div style="font-size: 50px; margin-bottom: 20px;">🚧</div>
            <h3>${title}</h3>
            <p>Раздел в разработке.</p>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

function openSettings() {
    let html = `
        <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--bg3); padding-bottom: 10px;">
                <span>Темная тема</span>
                <span style="color: var(--accent);">Включена</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--bg3); padding-bottom: 10px;">
                <span>Версия приложения</span>
                <span style="color: var(--fg-dim);">7.1</span>
            </div>
        </div>
        <button class="menu-item" onclick="localStorage.clear(); alert('Данные очищены'); renderMainMenu();" style="width: 100%; border: none; background: #ff3b30; color: white; padding: 15px; border-radius: 8px; font-weight: bold;">
            Очистить данные
        </button>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}

function setNavActive(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('nav-' + tabId);
    if (el) el.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
    document.getElementById('nav-main')?.addEventListener('click', renderMainMenu);
    document.getElementById('nav-objects')?.addEventListener('click', openObjects);
    document.getElementById('nav-tasks')?.addEventListener('click', () => showStub('📋 Задачи'));
    document.getElementById('nav-finance')?.addEventListener('click', () => showStub('💰 Финансы'));
});
