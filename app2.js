// ==========================================
// ЧИСТЫЙ КОД APP2.JS (БЕЗ ДУБЛЕЙ И МУСОРА)
// ==========================================

const MOCK_OBJECTS = [
    { id: 27, name: "Рароа", status: "active", balance: 0 },
    { id: 26, name: "Арбат", status: "active", balance: 106618 },
    { id: 25, name: "Барклая", status: "active", balance: -450 },
    { id: 24, name: "Вавилова", status: "completed", balance: 0 },
    { id: 23, name: "Объект на Ленина", status: "active", balance: 50000 }
];

let CURRENT_OBJECT = null;

// --- УТИЛИТЫ ---
function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function setNavActive(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('nav-' + tabId);
    if (el) el.classList.add('active');
}

// --- ГЛАВНОЕ МЕНЮ ---
function renderMainMenu() {
    CURRENT_OBJECT = null;
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в Master Bo 7.1!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}

// --- ОБЪЕКТЫ ---
function openObjects() {
    let saved = localStorage.getItem('bo_objects');
    let objects = saved ? JSON.parse(saved) : [...MOCK_OBJECTS];
    let html = `<div class="object-list" style="padding-top: 20px;">`;
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
            <div style="font-size: 20px; font-weight: bold; color: var(--fg); margin-bottom: 10px;">${escapeHtml(obj.name)}</div>
            <div>Статус: <span style="color: ${obj.status === 'active' ? 'var(--accent)' : '#fff'}">${obj.status === 'active' ? 'В работе' : 'Завершен'}</span></div>
            <div>Баланс: ${obj.balance} ₽</div>
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
    if (!name) { document.getElementById('new-obj-name').focus(); return; }
    let saved = localStorage.getItem('bo_objects');
    let objects = saved ? JSON.parse(saved) : [...MOCK_OBJECTS];
    objects.unshift({ id: Date.now(), name: name, status: "active", balance: Number(budget) || 0 });
    localStorage.setItem('bo_objects', JSON.stringify(objects));
    openObjects();
}

// --- ДНЕВНИК ---
function openDiary() {
    let records = JSON.parse(localStorage.getItem('bo_diary') || '[]');
    let html = `
        <div class="header" style="justify-content: space-between; margin-bottom: 20px; display: flex; align-items: center;">
            <h2 style="margin: 0; font-size: 22px;">Дневник работ</h2>
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
                    <div class="obj-details" style="font-size: 10px;">
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
            <textarea id="diary-note" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 15px; height: 70px; resize: none;" placeholder="Например: Покрасил стены в зале..."></textarea>
            <label style="display:block; margin-bottom: 5px; color: var(--fg-dim);">Часы (например: 2.5)</label>
            <input type="number" id="diary-hours" step="0.5" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg3); color: white; margin-bottom: 20px;" placeholder="0">
            <button onclick="saveDiaryRecord()" style="width: 100%; padding: 15px; background: var(--accent); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить</button>
            <button onclick="openDiary()" style="width: 100%; padding: 15px; background: none; color: var(--fg-dim); border: none; font-size: 14px; cursor: pointer; margin-top: 10px;">Назад</button>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}

function saveDiaryRecord() {
    let note = document.getElementById('diary-note').value;
    let hours = document.getElementById('diary-hours').value;
    if (!note) { document.getElementById('diary-note').focus(); return; }
    let records = JSON.parse(localStorage.getItem('bo_diary') || '[]');
    let d = new Date();
    let dateStr = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
    records.unshift({ id: Date.now(), date: dateStr, note: note, hours: hours || 0 });
    localStorage.setItem('bo_diary', JSON.stringify(records));
    openDiary();
}

// --- ФИНАНСЫ ---
function openFinance() {
    let html = `
        <div class="header" style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px;">Финансы</h2>
        </div>
        <div class="object-list">
            <div class="object-card" onclick="showStub('Сметы', 'estimates')" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="obj-title">Сметы</div>
                    <div style="font-size: 10px; color: var(--fg-dim); margin-top: 5px;">Управление сметами и расценками</div>
                </div>
                <div style="color: var(--fg-dim);">➔</div>
            </div>
            <div class="object-card" style="opacity: 0.5; cursor: default;">
                <div class="obj-title">Доходы и расходы</div>
                <div style="font-size: 10px; color: var(--fg-dim); margin-top: 5px;">Раздел в разработке</div>
            </div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('finance');
}

// --- МЕНЮ "ДОБАВИТЬ" (ТОЛЬКО SVG, БЕЗ ЭМОДЖИ) ---


function openAddMenu() {
    const addBtn = document.getElementById('add-btn-floating');
    const existing = document.getElementById('add-menu-overlay');
    
    // Если меню уже открыто — закрываем его
    if (existing) {
        existing.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
        return;
    }

    // Меняем иконку на стрелку вниз
    if (addBtn) {
        addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    }

    const menuItems = [
        { text: 'Объект', action: () => openAddObject(), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>' },
        { text: 'Контрагент', action: () => showStub('Контрагент', 'crm'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
        { text: 'Документ', action: () => showStub('Документ', 'reports'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>' },
        { text: 'Дневник', action: () => openDiary(), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
        { text: 'Инструмент', action: () => showStub('Инструмент', 'objects'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>' },
        { text: 'Поступление', action: () => showStub('Поступление денег', 'finance'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>' },
        { text: 'Расход', action: () => showStub('Расход денег', 'finance'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
        { text: 'Задача', action: () => showStub('Задача', 'tasks'), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' }
    ];

    const overlay = document.createElement('div');
    overlay.id = 'add-menu-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 999; display: flex; align-items: flex-end; justify-content: center;';

    let html = `
        <div id="add-menu-content" style="width: 100%; max-width: 500px; background: transparent; padding: 0 15px 15px 15px; animation: slideUp 0.3s ease; margin-bottom: 140px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: var(--bg3); padding: 15px; border-radius: 16px;">
    `;

    menuItems.forEach((item, index) => {
        html += `
            <div class="add-menu-item" data-index="${index}" style="background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: var(--fg); height: 80px;">
                <span style="display: flex; align-items: center; justify-content: center; pointer-events: none;">${item.svg}</span> 
                <span style="font-size: 10px; font-weight: 500; text-align: center; pointer-events: none;">${item.text}</span>
            </div>
        `;
    });

    html += `</div></div>`;
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // Функция закрытия меню
    const closeMenu = () => {
        overlay.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
    };

    // Закрытие по клику вне окна
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });

    // Обработчики для кнопок
    overlay.querySelectorAll('.add-menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            closeMenu();
            menuItems[idx].action();
        });
    });
}



// --- ЗАГЛУШКИ И НАСТРОЙКИ ---
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

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
});
