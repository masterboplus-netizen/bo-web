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

        let html = `<div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">`;

        if (!logs || logs.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Записей пока нет. Нажмите «+», чтобы создать первую.</div>`;
        } else {
            logs.forEach(log => {
                const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
                let details = [];
                if (log.hours) details.push(`${log.hours} ч.`);
                if (log.qty) details.push(`${log.qty} ${log.unit || ''}`);

                html += `
                    <div onclick="window.openDiaryEntryDetail(${log.id})" style="background: var(--bg2); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--bg3); cursor: pointer;">
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

// === ИНФОРМАЦИОННАЯ КАРТОЧКА ЗАПИСИ ===
window.openDiaryEntryDetail = async function(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: log, error } = await db.from('task_progress').select('*').eq('id', id).single();
        if (error) throw error;

        // Получаем название задачи для отображения
        let taskTitle = 'Задача ID: ' + log.task_id;
        try {
            const { data: task } = await db.from('tasks').select('title').eq('id', log.task_id).single();
            if (task) taskTitle = task.title;
        } catch(e) {}

        const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button onclick="window.openDiary()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button onclick="window.openDiaryActions(${log.id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>

                <h2 style="color: var(--fg); margin: 0 0 10px 0; font-size: 22px;">${date}</h2>
                
                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); margin-bottom: 15px;">
                    <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Что сделано</div>
                    <div style="color: var(--fg); font-size: 15px; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(log.description || 'Без описания')}</div>
                </div>

                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    ${log.hours ? `<div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); flex: 1;"><div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Часы</div><div style="color: var(--accent); font-size: 18px; font-weight: bold;">${log.hours} ч.</div></div>` : ''}
                    ${log.qty ? `<div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); flex: 1;"><div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Кол-во</div><div style="color: var(--fg); font-size: 18px; font-weight: bold;">${log.qty} ${log.unit || ''}</div></div>` : ''}
                </div>

                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer;" onclick="window.openTaskDetail(${log.task_id})">
                    <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Привязано к задаче</div>
                    <div style="color: var(--accent); font-size: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                        <span>${escapeHtml(taskTitle)}</span>
                        <span>→</span>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки записи: ' + err.message);
        window.openDiary();
    }
};

