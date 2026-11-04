import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderTasks() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        // Запрашиваем задачи из Supabase
        const { data: tasks, error } = await db
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
            return;
        }

        let html = '<div style="padding: 10px;">';
        
        tasks.forEach(task => {
            let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
            let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';
            
            html += `
                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-weight: bold; font-size: 16px; color: var(--fg);">${escapeHtml(task.title || 'Без названия')}</div>
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${statusText}</span>
                    </div>
                    ${task.description ? `<div style="font-size: 14px; color: var(--fg-dim);">${escapeHtml(task.description)}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--fg-dim); margin-top: 5px;">
                        <span>ID: ${task.id}</span>
                        <span>${new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
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

export function openNewTask() {
    const container = document.getElementById('app-content');
    
    // Стандартная дата - сегодня
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: var(--fg); margin-bottom: 20px;">Новая задача</h2>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название *</label>
                <input type="text" id="new-task-title" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;" placeholder="Например: Приклеить плитку">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                <textarea id="new-task-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;" placeholder="Детали задачи..."></textarea>
            </div>

            <div style="margin-bottom: 15px; display: flex; gap: 10px;">
                <div style="flex: 1;">
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Приоритет</label>
                    <select id="new-task-priority" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                        <option value="low">Низкий</option>
                        <option value="medium" selected>Средний</option>
                        <option value="high">Высокий</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Срок</label>
                    <input type="date" id="new-task-deadline" value="${today}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                </div>
            </div>

            <!-- Быстрые кнопки срока -->
            <div style="display: flex; gap: 8px; margin-bottom: 25px; flex-wrap: wrap;">
                <button onclick="document.getElementById('new-task-deadline').value = new Date().toISOString().split('T')[0]" style="flex: 1; padding: 8px; border-radius: 20px; border: 1px solid var(--accent); background: transparent; color: var(--accent); cursor: pointer; font-size: 12px;">Сегодня</button>
                <button onclick="const d = new Date(); d.setDate(d.getDate() + 1); document.getElementById('new-task-deadline').value = d.toISOString().split('T')[0]" style="flex: 1; padding: 8px; border-radius: 20px; border: 1px solid var(--accent); background: transparent; color: var(--accent); cursor: pointer; font-size: 12px;">Завтра</button>
                <button onclick="const d = new Date(); d.setDate(d.getDate() + 3); document.getElementById('new-task-deadline').value = d.toISOString().split('T')[0]" style="flex: 1; padding: 8px; border-radius: 20px; border: 1px solid var(--accent); background: transparent; color: var(--accent); cursor: pointer; font-size: 12px;">+3 дня</button>
            </div>

            <button onclick="window.saveNewTask()" style="width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">Сохранить</button>
            <button onclick="window.openTasks()" style="width: 100%; padding: 14px; background: transparent; color: var(--fg-dim); border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">Отмена</button>
        </div>
    `;
}

export async function saveNewTask() {
    const title = document.getElementById('new-task-title').value.trim();
    const desc = document.getElementById('new-task-desc').value.trim();
    const priority = document.getElementById('new-task-priority').value;
    const deadline = document.getElementById('new-task-deadline').value;

    if (!title) {
        alert('Название задачи обязательно!');
        return;
    }

    try {
        const { error } = await db.from('tasks').insert([{
            title: title,
            description: desc || null,
            priority: priority,
            deadline: deadline || null,
            status: 'active'
        }]);

        if (error) throw error;
        
        // Возвращаемся к списку задач
        window.openTasks();
    } catch (err) {
        console.error(err);
        alert('Ошибка при сохранении: ' + err.message);
    }
}
