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

document.addEventListener('DOMContentLoaded', () => {
    renderMainMenu();
});
