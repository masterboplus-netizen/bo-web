import { renderCalendarWidget } from '../ui/calendar_widget.js';
import { db } from '../api/supabase.js';

export async function renderCalendar() {
    if (window.setNavActive) window.setNavActive('calendar');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка календаря...</div>';

    try {
        const { data: objects, error } = await db.from('objects').select('*');
        if (error) throw error;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: var(--fg); margin-bottom: 15px;">Календарь</h2>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px;">
                    <button onclick="window.loadCalendarTab(null, 'Общий')" id="cal-tab-general" style="padding: 8px 16px; border-radius: 20px; background: var(--accent); color: white; border: none; cursor: pointer; white-space: nowrap; font-weight: bold;">Общий календарь</button>
        `;

        objects.forEach(obj => {
            html += `<button onclick="window.loadCalendarTab(${obj.id}, '${obj.name}')" id="cal-tab-${obj.id}" style="padding: 8px 16px; border-radius: 20px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); cursor: pointer; white-space: nowrap;">${obj.name}</button>`;
        });

        html += `</div><div id="calendar-container"></div></div>`;
        container.innerHTML = html;

        window.loadCalendarTab = function(objectId, objName) {
            // Сброс стилей кнопок
            document.querySelectorAll('[id^="cal-tab-"]').forEach(btn => {
                btn.style.background = 'var(--bg2)';
                btn.style.color = 'var(--fg)';
                btn.style.fontWeight = 'normal';
            });
            const activeBtn = document.getElementById(objectId ? `cal-tab-${objectId}` : 'cal-tab-general');
            if (activeBtn) {
                activeBtn.style.background = 'var(--accent)';
                activeBtn.style.color = 'white';
                activeBtn.style.fontWeight = 'bold';
            }

            renderCalendarWidget('calendar-container', objectId);
        };

        // По умолчанию грузим общий календарь
        window.loadCalendarTab(null, 'Общий');

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.showTasksForDate = async function(dateStr) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').eq('deadline_start', dateStr);
        if (error) throw error;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <button onclick="window.renderCalendar()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад к календарю</button>
                <h2 style="color: var(--fg); margin-bottom: 20px;">Задачи на ${new Date(dateStr).toLocaleDateString('ru-RU')}</h2>
        `;

        if (!tasks || tasks.length === 0) {
            html += `<div style="color: var(--fg-dim); text-align: center;">На этот день задач нет.</div>`;
        } else {
            tasks.forEach(task => {
                html += `
                    <div onclick="window.openTaskDetail(${task.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; border: 1px solid var(--bg3); cursor: pointer;">
                        <div style="font-weight: bold; color: var(--fg);">${task.title || 'Без названия'}</div>
                        <div style="font-size: 12px; color: var(--fg-dim); margin-top: 5px;">${task.description || ''}</div>
                    </div>
                `;
            });
        }
        html += `</div>`;
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
};
