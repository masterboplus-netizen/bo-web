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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--fg); margin: 0;">Дневник работ</h2>
                    <button onclick="window.openAddDiaryEntry()" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Добавить
                    </button>
                </div>
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

window.openAddDiaryEntry = async function() {
    const container = document.getElementById('app-content');
    
    try {
        const { data: tasks, error } = await db.from('tasks').select('id, title');
        if (error) throw error;

        let options = tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');

        container.innerHTML = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <button onclick="window.openDiary()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад к дневнику</button>
                <h2 style="color: var(--fg); margin-bottom: 20px;">Новая запись</h2>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Задача</label>
                        <select id="diary-task-id" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            ${options}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Что сделано</label>
                        <textarea id="diary-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;"></textarea>
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
                    
                    <button onclick="window.saveDiaryEntry()" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки задач: ' + err.message);
    }
};

window.saveDiaryEntry = async function() {
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
