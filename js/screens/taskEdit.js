import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openEditTask(id) {
    localStorage.setItem('currentTaskId', id);
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: task, error } = await db.from('tasks').select('*').eq('id', id).single();
        if (error) throw error;

        const hasDeadlineEnd = task.deadline_end !== null;

        let html = `
            <div style="padding: 0 20px 20px 20px; max-width: 600px; margin: 0 auto; padding-bottom: 120px;">
                <button onclick="window.openTaskDetail(${task.id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название</label>
                        <input type="text" id="edit-task-title" value="${escapeHtml(task.title || '')}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                        <textarea id="edit-task-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">${escapeHtml(task.description || '')}</textarea>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <label style="color: var(--fg-dim);">Плановый срок</label>
                            <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 2px;">
                                <button onclick="window.toggleDeadlineType('single')" id="btn-single" style="padding: 4px 10px; border-radius: 10px; border: none; background: ${!hasDeadlineEnd ? 'var(--accent)' : 'transparent'}; color: ${!hasDeadlineEnd ? 'white' : 'var(--fg-dim)'}; font-size: 12px; cursor: pointer;">Одна дата</button>
                                <button onclick="window.toggleDeadlineType('range')" id="btn-range" style="padding: 4px 10px; border-radius: 10px; border: none; background: ${hasDeadlineEnd ? 'var(--accent)' : 'transparent'}; color: ${hasDeadlineEnd ? 'white' : 'var(--fg-dim)'}; font-size: 12px; cursor: pointer;">Диапазон</button>
                            </div>
                        </div>
                        <div id="deadline-single" style="display: ${!hasDeadlineEnd ? 'block' : 'none'};">
                            <input type="date" id="edit-task-deadline-start" value="${task.deadline_start || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>
                        <div id="deadline-range" style="display: ${hasDeadlineEnd ? 'block' : 'none'};">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="date" id="edit-task-deadline-start-range" value="${task.deadline_start || ''}" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                                <span style="color: var(--fg-dim); margin: 0 2px;">—</span>
                                <input type="date" id="edit-task-deadline-end" value="${task.deadline_end || ''}" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Приоритет</label>
                            <select id="edit-task-priority" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Низкий</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Средний</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Высокий</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Статус</label>
                            <select id="edit-task-status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                                <option value="active" ${task.status === 'active' ? 'selected' : ''}>В работе</option>
                                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Выполнена</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="window.saveTaskChanges(${task.id})" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
                </div>
            </div>
        `;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.toggleDeadlineType = function(type) {
    if (type === 'single') {
        document.getElementById('deadline-single').style.display = 'block';
        document.getElementById('deadline-range').style.display = 'none';
        document.getElementById('btn-single').style.background = 'var(--accent)';
        document.getElementById('btn-single').style.color = 'white';
        document.getElementById('btn-range').style.background = 'transparent';
        document.getElementById('btn-range').style.color = 'var(--fg-dim)';
    } else {
        document.getElementById('deadline-single').style.display = 'none';
        document.getElementById('deadline-range').style.display = 'block';
        document.getElementById('btn-range').style.background = 'var(--accent)';
        document.getElementById('btn-range').style.color = 'white';
        document.getElementById('btn-single').style.background = 'transparent';
        document.getElementById('btn-single').style.color = 'var(--fg-dim)';
    }
};

window.saveTaskChanges = async function(id) {
    const title = document.getElementById('edit-task-title').value.trim();
    const desc = document.getElementById('edit-task-desc').value.trim();
    const priority = document.getElementById('edit-task-priority').value;
    const status = document.getElementById('edit-task-status').value;

    let deadlineStart = null;
    let deadlineEnd = null;

    const isSingle = document.getElementById('deadline-single').style.display !== 'none';
    if (isSingle) {
        deadlineStart = document.getElementById('edit-task-deadline-start').value || null;
    } else {
        deadlineStart = document.getElementById('edit-task-deadline-start-range').value || null;
        deadlineEnd = document.getElementById('edit-task-deadline-end').value || null;
    }

    if (!title) return alert('Название не может быть пустым!');

    try {
        const { error } = await db.from('tasks').update({
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: deadlineStart,
            deadline_end: deadlineEnd,
            status: status
        }).eq('id', id);
        if (error) throw error;
        window.openTaskDetail(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

window.openEditTask = openEditTask;
