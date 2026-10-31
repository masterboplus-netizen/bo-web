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
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
        <h3 style="color: var(--fg);">Добро пожаловать в Master Bo!</h3>
        <p>Выберите раздел в меню внизу.</p>
    </div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('main');
}

async function openObjects() {
    let html = `<div class="object-list" style="padding-top: 10px;">`;
    const { data: objects, error } = await db.from('objects').select('*').order('created_at', { ascending: false });
    if (error) {
        html += `<div style="color: red; text-align: center; padding: 20px;">Ошибка: ${error.message}</div>`;
    } else if (!objects || objects.length === 0) {
        html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет. Создайте первый!</div>`;
    } else {
        objects.forEach(obj => {
            let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
            let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
            html += `
                <div class="object-card">
                    <div class="obj-title">${escapeHtml(obj.name)}</div>
                    <div class="obj-details">
                        <span class="badge" style="background: ${statusColor}">${statusText}</span>
                        <span class="budget">${obj.budget || 0} ₽</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('objects');
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
    let code = 'OBJ-' + Math.random().toString(16).substring(2, 10).toUpperCase();
    const { data: newObj, error } = await db.from('objects').insert([{ code: code, name: name, address: address || null, budget: Number(budget) || 0, status: 'active' }]).select();
    if (error) { alert('Ошибка: ' + error.message); return; }
    if (newObj && newObj.length > 0) {
        const objectId = newObj[0].id;
        await db.from('floors').insert([{ object_id: objectId, floor_number: 1, floor_name: 'Этаж 1' }]);
    }
    openObjects();
}

function openTasks() {
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задачи (в разработке)</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('tasks');
}

function openDiary() {
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Дневник (в разработке)</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('diary');
}

function openFinance() {
    let html = `<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Финансы (в разработке)</div>`;
    document.getElementById('app-content').innerHTML = html;
    setNavActive('finance');
}

function openSettings() {
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

function openAddMenu() {
    const menuItems = [
        { text: 'Объект', action: () => openAddObject() },
        { text: 'Задача', action: () => showStub('Задача', 'tasks') },
        { text: 'Дневник', action: () => openDiary() },
        { text: 'Финансы', action: () => openFinance() }
    ];
    let html = `
        <div style="position: fixed; bottom: 140px; left: 20px; right: 20px; background: var(--bg2); border-radius: 16px; padding: 15px; z-index: 9999; border: 1px solid var(--bg3);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
    `;
    menuItems.forEach((item, idx) => {
        html += `<button onclick="(${item.action.toString()})()" style="padding: 15px; border-radius: 10px; border: none; background: var(--bg3); color: var(--fg); font-size: 14px; cursor: pointer;">${item.text}</button>`;
    });
    html += `</div></div>`;
    // Временно добавляем в body
    const div = document.createElement('div');
    div.id = 'temp-add-menu';
    div.innerHTML = html;
    div.onclick = () => div.remove();
    document.body.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
});
