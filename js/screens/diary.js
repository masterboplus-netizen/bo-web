import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// === СПИСОК ЗАПИСЕЙ ===
export async function renderDiary() {
    if (window.setNavActive) window.setNavActive('diary');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка дневника...</div>';

    try {
        const { data: logs, error } = await db.from('task_progress').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                
        `;

        if (!logs || logs.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Записей пока нет. Нажмите «Добавить», чтобы создать первую.</div>`;
        } else {
            logs.forEach(log => {
                const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
                let details = [];
                if (log.hours) details.push(`${log.hours} ч.`);
                if (log.qty) details.push(`${log.qty} ${log.unit || ''}`);

                html += `
                    <div onclick="window.openEditDiaryEntry(${log.id})" style="background: var(--bg2); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--bg3); cursor: pointer;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: var(--fg-dim);">${date}</span>
                            ${details.length > 0 ? `<span style="font-size: 12px; color: var(--accent); font-weight: bold;">${details.join(' • ')}</span>` : ''}
                        </div>
                        <div style="color: var(--fg); font-size: 15px; margin-bottom: 8px;">${escapeHtml(log.description || 'Без описания')}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12px; color: var(--fg-dim);">Задача ID: ${log.task_id}</span>
                            <button onclick="event.stopPropagation(); window.openTaskDetail(${log.task_id})" style="background: var(--bg3); border: none; color: var(--accent); font-size: 12px; padding: 4px 8px; border-radius: 6px; cursor: pointer;">К задаче →</button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки: ${err.message}</div>`;
    }
}

// === ФОРМА РЕДАКТИРОВАНИЯ (ИЛИ ДОБАВЛЕНИЯ) ===
window.openEditDiaryEntry = async function(id = null) {
    const container = document.getElementById('app-content');
    let log = null;

    if (id) {
        try {
            const { data, error } = await db.from('task_progress').select('*').eq('id', id).single();
            if (error) throw error;
            log = data;
        } catch (err) {
            alert('Ошибка загрузки записи: ' + err.message);
            return;
        }
    }

    try {
        const { data: tasks, error } = await db.from('tasks').select('id, title');
        if (error) throw error;

        let options = tasks.map(t => `<option value="${t.id}" ${log && log.task_id == t.id ? 'selected' : ''}>${escapeHtml(t.title)}</option>`).join('');

        container.innerHTML = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <button onclick="window.openDiary()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2 style="color: var(--fg); margin-bottom: 20px;">${id ? 'Редактировать запись' : 'Новая запись'}</h2>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Задача</label>
                        <select id="diary-task-id" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            ${options}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Что сделано</label>
                        <textarea id="diary-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">${escapeHtml(log?.description || '')}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Часы</label>
                            <input type="number" id="diary-hours" value="${log?.hours || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Кол-во</label>
                            <input type="number" id="diary-qty" value="${log?.qty || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Ед. изм.</label>
                        <input type="text" id="diary-unit" value="${escapeHtml(log?.unit || '')}" placeholder="ряды, м2, шт" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="window.saveDiaryEntry(${id || 'null'})" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить</button>
                        ${id ? `<button onclick="window.deleteDiaryEntry(${id})" style="padding: 14px 20px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">Удалить</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки задач: ' + err.message);
    }
};

window.openAddDiaryEntry = function() {
    window.openEditDiaryEntry(null);
};

// === СОХРАНЕНИЕ ===
window.saveDiaryEntry = async function(id = null) {
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
        if (id) {
            const { error } = await db.from('task_progress').update(entry).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await db.from('task_progress').insert([entry]);
            if (error) throw error;
        }
        window.openDiary();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

// === УДАЛЕНИЕ ===
window.deleteDiaryEntry = async function(id) {
    if (!confirm('Удалить эту запись?')) return;
    try {
        const { error } = await db.from('task_progress').delete().eq('id', id);
        if (error) throw error;
        window.openDiary();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};
