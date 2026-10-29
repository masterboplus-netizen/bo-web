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
    const addBtn = document.getElementById('add-btn-floating');
    if (addBtn) addBtn.style.display = 'flex';
    CURRENT_OBJECT = null;
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в Master Bo 7.1!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
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
            <div class="object-card" onclick="openObjectById(${obj.id})">
                <div class="obj-title">${escapeHtml(obj.name)}</div>
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

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function openObjectById(id) {
    let saved = localStorage.getItem('bo_objects');
    let objects = saved ? JSON.parse(saved) : [...MOCK_OBJECTS];
    let obj = objects.find(o => o.id == id);
    if (obj) openObject(obj);
}

function openObject(obj) {
    CURRENT_OBJECT = obj;
    let html = `
        <div style="margin-bottom: 20px; color: var(--fg-dim); background: var(--bg2); padding: 15px; border-radius: 12px;">
            <div style="font-size: 20px; font-weight: bold; color: var(--fg); margin-bottom: 10px;">${obj.name}</div>
            <div>Статус: <span style="color: ${obj.status === 'active' ? 'var(--accent)' : '#fff'}">${obj.status === 'active' ? 'В работе' : 'Завершен'}</span></div>
            <div>Баланс: ${obj.balance} ₽</div>
        </div>
        
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('objects');
}





function openAddMenu() {
    console.log("openAddMenu вызвана!");
    const addBtn = document.getElementById('add-btn-floating');
    if (addBtn) addBtn.style.display = 'none';

    // Массив наших кнопок: [Иконка, Название, Действие]
    const menuItems = [
        { icon: '📔', text: 'Запись в дневник', action: () => openDiary() },
        { icon: '📋', text: 'Новая задача', action: () => showStub('📋 Новая задача', 'add') },
        { icon: '💸', text: 'Расход денег', action: () => showStub('💸 Расход денег', 'add') },
        { icon: '💰', text: 'Поступление денег', action: () => showStub('💰 Поступление денег', 'add') },
        { icon: '📄', text: 'Документ', action: () => showStub('📄 Документ', 'add') },
        { icon: '🏠', text: 'Новый объект', action: () => openAddObject() },
        { icon: '🛠', text: 'Инструмент', action: () => showStub('🛠 Инструмент', 'add') }
    ];

    let html = `
        <div class="header" style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px;">Добавить</h2>
        </div>
        <div id="add-menu-container" style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    // Генерируем HTML без onclick
    menuItems.forEach((item, index) => {
        html += `
            <div class="add-menu-item" data-index="${index}" style="width: 100%; background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; cursor: pointer; color: var(--fg); font-size: 16px; font-weight: bold; user-select: none;">
                <span style="font-size: 24px; pointer-events: none;">${item.icon}</span> 
                <span style="pointer-events: none;">${item.text}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div id="add-menu-cancel" style="width: 100%; padding: 15px; text-align: center; color: var(--fg-dim); font-size: 16px; cursor: pointer; margin-top: 20px; user-select: none;">Отмена</div>
    `;
    
    document.getElementById('app-content').innerHTML = html;

    // Привязываем обработчики через addEventListener
    document.querySelectorAll('.add-menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            menuItems[idx].action();
        });
    });

    document.getElementById('add-menu-cancel').addEventListener('click', closeAddMenu);
}








function closeAddMenu() {
    const addBtn = document.getElementById('add-btn-floating');
    if (addBtn) addBtn.style.display = 'flex';
    renderMainMenu();
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


function openDiary() {
    let records = JSON.parse(localStorage.getItem('bo_diary') || '[]');
    let html = `
        <div class="header" style="justify-content: space-between; margin-bottom: 20px; display: flex; align-items: center;">
            <h2 style="margin: 0; font-size: 22px;">📔 Дневник работ</h2>
            <button onclick="openAddDiaryRecord()" style="background: var(--accent); color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">+ Запись</button>
        </div>
        <div class="object-list">
    `;
    if (records.length === 0) {
        html += `<div style="text-align:center; color:var(--fg-dim); margin-top:50px;">Записей пока нет.</div>`;
    } else {
        records.forEach(r => {
            html += `
                <div class="object-card" style="cursor: default;">
                    <div class="obj-title" style="font-size: 16px; margin-bottom: 5px;">${escapeHtml(r.note)}</div>
                    <div class="obj-details" style="font-size: 12px;">
                        <span class="badge" style="background: var(--bg3); color: var(--fg);">${r.date}</span>
                        <span class="budget">⏱ ${r.hours} ч.</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('diary');
}

function openAddDiaryRecord() {
    let html = `
        <div style="background: var(--bg2); padding: 20px; border-radius: 12px;">
            <h3 style="margin-top:0;">Новая запись</h3>
            <label style="display:block; margin-bottom: 5px; color: var(--fg-dim);">Что сделано?</label>
            <textarea id="diary-note" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 15px; height: 80px; resize: none;" placeholder="Например: Покрасил стены в зале..."></textarea>
            <label style="display:block; margin-bottom: 5px; color: var(--fg-dim);">Часы (например: 2.5)</label>
            <input type="number" id="diary-hours" step="0.5" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 20px;" placeholder="0">
            <button onclick="saveDiaryRecord()" style="width: 100%; padding: 15px; background: var(--accent); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить</button>
            <button onclick="openDiary()" style="width: 100%; padding: 15px; background: none; color: var(--fg-dim); border: none; font-size: 14px; cursor: pointer; margin-top: 10px;">Отмена</button>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

function saveDiaryRecord() {
    let note = document.getElementById('diary-note').value;
    let hours = document.getElementById('diary-hours').value;
    if (!note) { alert('Напишите, что было сделано!'); return; }
    let records = JSON.parse(localStorage.getItem('bo_diary') || '[]');
    let d = new Date();
    let dateStr = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
    records.unshift({ id: Date.now(), date: dateStr, note: note, hours: hours || 0 });
    localStorage.setItem('bo_diary', JSON.stringify(records));
    openDiary();
}

function openFinance() {
    let html = `
        <div class="header" style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px;">💰 Финансы</h2>
        </div>
        <div class="object-list">
            <div class="object-card" onclick="showStub('📊 Сметы', 'estimates')" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="obj-title">📊 Сметы</div>
                    <div style="font-size: 12px; color: var(--fg-dim); margin-top: 5px;">Управление сметами и расценками</div>
                </div>
                <div style="color: var(--fg-dim);">➔</div>
            </div>
            <div class="object-card" style="opacity: 0.5; cursor: default;">
                <div class="obj-title">📈 Доходы и расходы</div>
                <div style="font-size: 12px; color: var(--fg-dim); margin-top: 5px;">Раздел в разработке</div>
            </div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('finance');
}
function showStub(title, tabId) {
    let html = `
        <div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
            <div style="font-size: 50px; margin-bottom: 20px;">🚧</div>
            <h3>${title}</h3>
            <p>Раздел в разработке.</p>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    if (tabId) setNavActive(tabId);
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
        <button class="menu-item" onclick="localStorage.removeItem('bo_objects'); alert('Данные очищены'); renderMainMenu();" style="width: 100%; border: none; background: #ff3b30; color: white; padding: 15px; border-radius: 8px; font-weight: bold;">
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
    
    document.getElementById('nav-objects')?.addEventListener('click', openObjects);
    
    
});
