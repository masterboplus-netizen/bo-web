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
