import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderTasks() {
    if (window.setNavActive) window.setNavActive('tasks');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
            return;
        }

        let html = '<div style="padding: 10px; max-width: 600px; margin: 0 auto;">';
        tasks.forEach(task => {
            let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
            let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';
            
            let deadlineDisplay = '';
            if (task.deadline_start) {
                deadlineDisplay = new Date(task.deadline_start).toLocaleDateString('ru-RU');
                if (task.deadline_end) {
                    deadlineDisplay += ` — ${new Date(task.deadline_end).toLocaleDateString('ru-RU')}`;
                }
            }

            html += `
                <div onclick="window.openTaskDetail(${task.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--bg3); cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-weight: bold; font-size: 16px; color: var(--fg); word-break: break-word;">${escapeHtml(task.title || 'Без названия')}</div>
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; white-space: nowrap; margin-left: 10px;">${statusText}</span>
                    </div>
                    ${task.description ? `<div style="font-size: 14px; color: var(--fg-dim); word-break: break-word;">${escapeHtml(task.description)}</div>` : ''}
                    ${deadlineDisplay ? `<div style="font-size: 12px; color: var(--fg-dim);">Срок: ${deadlineDisplay}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--fg-dim); margin-top: 5px;">
                        <span>ID: ${task.id}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span>${new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки задач: ${err.message}</div>`;
    }
}

// === МЕНЮ ДЕЙСТВИЙ (ТРИ ТОЧКИ) ===




window.setQuickDate = function(type) {
    const today = new Date();
    let targetDate = new Date(today);

    if (type === 'tomorrow') targetDate.setDate(today.getDate() + 1);
    else if (type === 'plus3') targetDate.setDate(today.getDate() + 3);
    else if (type === 'plus7') targetDate.setDate(today.getDate() + 7);

    const dateStr = targetDate.toISOString().split('T')[0];

    const singleInput = document.getElementById('edit-task-deadline-start');
    const rangeStart = document.getElementById('edit-task-deadline-start-range');
    const rangeEnd = document.getElementById('edit-task-deadline-end');

    // Подсветка нажатой кнопки
    const btn = document.querySelector(`button[onclick="window.setQuickDate('${type}')"]`);
    if (btn) {
        const originalBg = btn.style.background;
        const originalColor = btn.style.color;
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.style.background = originalBg;
            btn.style.color = originalColor;
        }, 300);
    }

    if (singleInput && singleInput.offsetParent !== null) {
        singleInput.value = dateStr;
    } else if (rangeStart && rangeEnd) {
        if (!rangeStart.value) {
            rangeStart.value = dateStr;
        } else {
            rangeEnd.value = dateStr;
        }
    }
};


window.toggleTaskStatus = async function(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'active' : 'done';
    try {
        const { error } = await db.from('tasks').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        window.openTaskDetail(id);
    } catch (err) {
        alert('Ошибка обновления статуса: ' + err.message);
    }
};


