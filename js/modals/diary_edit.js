import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// === МЕНЮ ДЕЙСТВИЙ (ТРИ ТОЧКИ) ===
window.openDiaryActions = function(id) {
    const oldMenu = document.getElementById('diary-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'diary-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';

    menu.innerHTML = `
        <div onclick="window.openEditDiaryEntry(${id})" style="padding: 14px 16px; color: var(--fg); font-size: 15px; cursor: pointer; border-bottom: 1px solid var(--bg3);">Редактировать</div>
        <div onclick="window.deleteDiaryEntry(${id})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="openDiaryActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};

// === РЕДАКТИРОВАНИЕ ===
window.openEditDiaryEntry = async function(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: log, error } = await db.from('task_progress').select('*').eq('id', id).single();
        if (error) throw error;

        const { data: tasks, error: tasksError } = await db.from('tasks').select('id, title');
        if (tasksError) throw tasksError;

        let options = tasks.map(t => `<option value="${t.id}" ${log.task_id == t.id ? 'selected' : ''}>${escapeHtml(t.title)}</option>`).join('');

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
                <button onclick="window.openDiaryEntryDetail(${id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; border: 1px solid var(--bg3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Задача</label>
                        <select id="diary-task-id" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            ${options}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Что сделано</label>
                        <textarea id="diary-desc" rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">${escapeHtml(log.description || '')}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Часы</label>
                            <input type="number" id="diary-hours" value="${log.hours || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Кол-во</label>
                            <input type="number" id="diary-qty" value="${log.qty || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Ед. изм.</label>
                        <input type="text" id="diary-unit" value="${escapeHtml(log.unit || '')}" placeholder="ряды, м2, шт" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>
                    </div>
                    <button onclick="window.saveDiaryEntry(${id})" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 20px;">Сохранить</button>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки: ' + err.message);
    }
};

window.saveDiaryEntry = async function(id) {
    const taskId = document.getElementById('diary-task-id').value;
    const desc = document.getElementById('diary-desc').value.trim();
    const hours = document.getElementById('diary-hours').value;
    const qty = document.getElementById('diary-qty').value;
    const unit = document.getElementById('diary-unit').value;

    if (!desc) return alert('Введите описание!');

    const entry = {
        task_id: taskId,
        description: desc,
        hours: hours ? parseFloat(hours) : null,
        qty: qty ? parseFloat(qty) : null,
        unit: unit || null,
        work_date: new Date().toISOString().split('T')[0]
    };

    try {
        const { error } = await db.from('task_progress').update(entry).eq('id', id);
        if (error) throw error;
        window.openDiaryEntryDetail(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

window.deleteDiaryEntry = async function(id) {
    window.showConfirm('Удалить эту запись?', async () => {
        try {
            const { error } = await db.from('task_progress').delete().eq('id', id);
            if (error) throw error;
            window.openDiary();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

// === ДОБАВЛЕНИЕ ===
window.openAddDiaryEntry = async function() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('id, title');
        if (error) throw error;

        let options = tasks.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('');

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
                <button onclick="window.openDiary()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; border: 1px solid var(--bg3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Задача</label>
                        <select id="diary-task-id" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            ${options}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Что сделано</label>
                        <textarea id="diary-desc" rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;"></textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Часы</label>
                            <input type="number" id="diary-hours" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Кол-во</label>
                            <input type="number" id="diary-qty" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Ед. изм.</label>
                        <input type="text" id="diary-unit" placeholder="ряды, м2, шт" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>
                    <button onclick="window.saveNewDiaryEntry()" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки: ' + err.message);
    }
};

window.saveNewDiaryEntry = async function() {
    const taskId = document.getElementById('diary-task-id').value;
    const desc = document.getElementById('diary-desc').value.trim();
    const hours = document.getElementById('diary-hours').value;
    const qty = document.getElementById('diary-qty').value;
    const unit = document.getElementById('diary-unit').value;

    if (!desc) return alert('Введите описание!');

    try {
        const { error } = await db.from('task_progress').insert([{
            task_id: taskId,
            description: desc,
            hours: hours ? parseFloat(hours) : null,
            qty: qty ? parseFloat(qty) : null,
            unit: unit || null,
            work_date: new Date().toISOString().split('T')[0]
        }]);
        if (error) throw error;
        window.openDiary();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};
