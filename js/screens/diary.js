import { db } from '../api/supabase.js';

export async function renderDiary() {
    if (window.setNavActive) window.setNavActive('diary');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка дневника...</div>';

    try {
        // Получаем все записи из task_progress
        const { data: logs, error } = await db.from('task_progress').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: var(--fg); margin-bottom: 20px;">Дневник работ</h2>
        `;

        if (!logs || logs.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Записей пока нет. Добавьте их через карточку задачи.</div>`;
        } else {
            logs.forEach(log => {
                const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
                
                let details = [];
                if (log.hours) details.push(`${log.hours} ч.`);
                if (log.qty) details.push(`${log.qty} ${log.unit || ''}`);

                html += `
                    <div onclick="window.openTaskDetail(${log.task_id})" style="background: var(--bg2); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--bg3); cursor: pointer;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: var(--fg-dim);">${date}</span>
                            ${details.length > 0 ? `<span style="font-size: 12px; color: var(--accent); font-weight: bold;">${details.join(' • ')}</span>` : ''}
                        </div>
                        <div style="color: var(--fg); font-size: 15px; margin-bottom: 8px;">${log.description || 'Без описания'}</div>
                        <div style="font-size: 12px; color: var(--fg-dim);">Задача ID: ${log.task_id}</div>
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
