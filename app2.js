const SUPABASE_URL = "https://ruomhtlvyqmaqhqqsfqn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1b21odGx2eXFtYXFocXFzZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTQwMjUsImV4cCI6MjEwODk3MDAyNX0.7FWm5KVmMqyVxNjXMhcGhgzb6nD8aLfie7cxBlohIO4";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

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

function renderMainMenu() {
    document.getElementById('filters-container').innerHTML = '';
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в Master Bo 7.1!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}

async function openObjects() {
    document.getElementById('filters-container').innerHTML = `
        <div style="display: flex; gap: 2px; background: var(--bg2); padding: 4px; border-radius: 30px; width: 100%; box-sizing: border-box;">
            <div style="flex: 1; text-align: center; background: var(--accent); color: white; padding: 10px 0; border-radius: 26px; font-size: 14px; font-weight: 500; cursor: pointer;">Всё</div>
            <div style="flex: 1; text-align: center; color: var(--fg-dim); padding: 10px 0; border-radius: 26px; font-size: 14px; font-weight: 500; cursor: pointer;">Активные</div>
            <div style="flex: 1; text-align: center; color: var(--fg-dim); padding: 10px 0; border-radius: 26px; font-size: 14px; font-weight: 500; cursor: pointer;">Архив</div>
        </div>
    `;
    let html = `<div class="object-list" style="padding-top: 10px;">`;
    const { data: objects, error } = await db.from('objects').select('*').order('created_at', { ascending: false });
    if (error) {
        html += `<div style="color: red; text-align: center; padding: 20px;">Ошибка: ${error.message}</div>`;
    } else if (!objects || objects.length === 0) {
        html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет.</div>`;
    } else {
        objects.forEach(obj => {
            html += `<div class="object-card"><div class="obj-title">${escapeHtml(obj.name)}</div><div class="obj-details"><span class="budget">${obj.budget || 0} ₽</span></div></div>`;
        });
    }
    html += `</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('objects');
}

function openTasks() {
    document.getElementById('filters-container').innerHTML = '';
    let html = `<div class="object-list" style="padding-top: 10px;"><div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Задачи (в разработке)</div></div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('tasks');
}

function showStub(title, tabId) {
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <div style="font-size: 50px; margin-bottom: 20px;">🚧</div><h3>${title}</h3><p>Раздел в разработке.</p></div>`;
    document.getElementById('app-content').innerHTML = html;
    if (tabId) setNavActive(tabId);
}


function openPersonal() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('💸 Личные', 'personal');
}

function openFinance() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('💰 Финансы', 'finance');
}

function openReports() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('📈 Отчёты', 'reports');
}

function openKPI() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('📊 KPI', 'kpi');
}

function openCRM() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('👥 CRM', 'crm');
}

document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
});


function openAddMenu() {
    const addBtn = document.getElementById('add-btn-floating');
    const existing = document.getElementById('add-menu-overlay');

    if (existing) {
        existing.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
        return;
    }

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
        { text: 'Задача', action: () => openTasks(), svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' }
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

    html += `</div>`;
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    const closeMenu = () => {
        overlay.remove();
        if (addBtn) {
            addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        }
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMenu();
    });

    overlay.querySelectorAll('.add-menu-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            closeMenu();
            menuItems[idx].action();
        });
    });
}

function openDiary() {
    document.getElementById('filters-container').innerHTML = '';
    showStub('📔 Дневник', 'diary');
}

function openSettings() {
    document.getElementById('filters-container').innerHTML = '';
    let html = `
        <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--bg3); padding-bottom: 10px;">
                <span>Версия приложения</span>
                <span style="color: var(--fg-dim);">7.1</span>
            </div>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}


function openAddObject() {
    let html = `
        <div style="padding-top: 10px;">
            <div style="margin-bottom: 25px;">
                <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Название объекта</label>
                <input type="text" id="new-obj-name" style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;" placeholder="Например: Квартира на Ленина">
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Адрес</label>
                <input type="text" id="new-obj-address" style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;" placeholder="Улица, дом, квартира">
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display:block; margin-bottom: 8px; color: var(--fg-dim); font-size: 14px;">Бюджет (₽)</label>
                <input type="number" id="new-obj-budget" style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;" placeholder="0">
            </div>

            <button onclick="saveObject()" style="width: 100%; padding: 18px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Создать объект</button>
            <button onclick="openObjects()" style="width: 100%; padding: 15px; background: none; color: var(--fg-dim); border: none; font-size: 14px; cursor: pointer; margin-top: 10px;">Отмена</button>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
}




async function saveObject() {
    let name = document.getElementById('new-obj-name').value;
    let address = document.getElementById('new-obj-address').value;
    let budget = document.getElementById('new-obj-budget').value;
    
    if (!name) { document.getElementById('new-obj-name').focus(); return; }

    // Генерируем код как в боте: OBJ-XXXXXXXX
    let code = 'OBJ-' + Math.random().toString(16).substring(2, 10).toUpperCase();

    // 1. Создаем объект
    const { data: newObj, error } = await db.from('objects').insert([{
        code: code,
        name: name,
        address: address || null,
        budget: Number(budget) || 0,
        status: 'active'
    }]).select();

    if (error) {
        alert('Ошибка: ' + error.message);
        return;
    }

    // 2. Автосоздаем "Этаж 1" (как в боте)
    if (newObj && newObj.length > 0) {
        const objectId = newObj[0].id;
        const { error: floorError } = await db.from('floors').insert([{
            object_id: objectId,
            floor_number: 1,
            floor_name: 'Этаж 1'
        }]);
        if (floorError) console.warn('Ошибка создания этажа:', floorError.message);
    }

    // 3. Возвращаемся к списку
    openObjects();
}

