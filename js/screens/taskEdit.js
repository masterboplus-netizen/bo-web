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
                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; border: 1px solid var(--bg3); box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box;">
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

// === МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ЗАДАЧИ ===
window.openEditTaskModal = async function(id) {
    try {
        const { data: task, error } = await db.from('tasks').select('*').eq('id', id).single();
        if (error) throw error;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.2s ease;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 20px; max-width: 400px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease; max-height: 80vh; overflow-y: auto;';

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--fg); font-size: 18px;">Редактировать задачу</h3>
                <button id="close-edit-task" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Название</label>
                <input type="text" id="modal-task-title" value="${escapeHtml(task.title || '')}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Описание</label>
                <textarea id="modal-task-desc" rows="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">${escapeHtml(task.description || '')}</textarea>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Плановый срок</label>
                <input type="date" id="modal-task-deadline" value="${task.deadline_start || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                <div style="flex: 1;">
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Приоритет</label>
                    <select id="modal-task-priority" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Низкий</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Средний</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Высокий</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Статус</label>
                    <select id="modal-task-status" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                        <option value="active" ${task.status === 'active' ? 'selected' : ''}>В работе</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Выполнена</option>
                    </select>
                </div>
            </div>

            <button onclick="window.saveEditTaskModal(${id})" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 5px;">Сохранить</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);

        function close() {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';
            setTimeout(() => overlay.remove(), 200);
        }

        document.getElementById('close-edit-task').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };

    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

window.saveEditTaskModal = async function(id) {
    const title = document.getElementById('modal-task-title').value.trim();
    const desc = document.getElementById('modal-task-desc').value.trim();
    const deadline = document.getElementById('modal-task-deadline').value || null;
    const priority = document.getElementById('modal-task-priority').value;
    const status = document.getElementById('modal-task-status').value;

    if (!title) return alert('Название не может быть пустым!');

    try {
        const { error } = await db.from('tasks').update({
            title: title,
            description: desc || null,
            deadline_start: deadline,
            priority: priority,
            status: status
        }).eq('id', id);
        if (error) throw error;

        // Закрываем модалку
        const overlay = document.querySelector('div[style*="z-index: 100000"]');
        if (overlay) overlay.remove();

        window.openTaskDetail(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

// === УНИВЕРСАЛЬНАЯ МОДАЛКА ДЛЯ РЕДАКТИРОВАНИЯ ОДНОГО ПОЛЯ ===
window.openEditField = async function(field, currentValue, taskId) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 20px; max-width: 400px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease;';

    let fieldLabel = '';
    let fieldHtml = '';

    if (field === 'description') {
        fieldLabel = 'Описание';
        fieldHtml = '<textarea id="modal-field-input" rows="4" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">' + currentValue + '</textarea>';
    } else if (field === 'deadline') {
        fieldLabel = 'Плановый срок';
        fieldHtml = `
            <div style="display: flex; background: var(--bg3); border-radius: 10px; padding: 2px; margin-bottom: 15px;">
                <button onclick="window.toggleModalDeadline('single')" id="modal-btn-single" style="flex: 1; padding: 8px; border-radius: 8px; border: none; background: var(--accent); color: white; font-size: 13px; cursor: pointer;">Одна дата</button>
                <button onclick="window.toggleModalDeadline('range')" id="modal-btn-range" style="flex: 1; padding: 8px; border-radius: 8px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Диапазон</button>
            </div>
            <div id="modal-deadline-single">
                <input type="date" id="modal-field-input" value="` + currentValue + `" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
            </div>
            <div id="modal-deadline-range" style="display: none;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="date" id="modal-field-input-start" value="` + currentValue + `" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <span style="color: var(--fg-dim);">—</span>
                    <input type="date" id="modal-field-input-end" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                </div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                <button onclick="window.setModalQuickDate('today')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Сегодня</button>
                <button onclick="window.setModalQuickDate('tomorrow')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Завтра</button>
                <button onclick="window.setModalQuickDate('plus3')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+3 дня</button>
                <button onclick="window.setModalQuickDate('plus7')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+7 дней</button>
            </div>
        `;
    } else if (field === 'priority') {
        fieldLabel = 'Приоритет';
        fieldHtml = '<select id="modal-field-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">' +
            '<option value="low" ' + (currentValue === 'low' ? 'selected' : '') + '>Низкий</option>' +
            '<option value="medium" ' + (currentValue === 'medium' ? 'selected' : '') + '>Средний</option>' +
            '<option value="high" ' + (currentValue === 'high' ? 'selected' : '') + '>Высокий</option>' +
            '</select>';
    }

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: var(--fg); font-size: 18px;">${fieldLabel}</h3>
            <button id="close-edit-field" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div style="margin-bottom: 15px;">
            ${fieldHtml}
        </div>
        <button onclick="window.saveEditField('${field}', ${taskId})" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer;">Сохранить</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    function close() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('close-edit-field').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

window.saveEditField = async function(field, taskId) {
    const value = document.getElementById('modal-field-input').value;

    try {
        const updateData = {};
        if (field === 'description') updateData.description = value || null;
        else if (field === 'deadline') updateData.deadline_start = value || null;
        else if (field === 'priority') updateData.priority = value;

        const { error } = await db.from('tasks').update(updateData).eq('id', taskId);
        if (error) throw error;

        // Закрываем модалку
        const overlay = document.querySelector('div[style*="z-index: 100000"]');
        if (overlay) overlay.remove();

        window.openTaskDetail(taskId);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};
