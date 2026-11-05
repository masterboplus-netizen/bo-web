import { db } from '../api/supabase.js';

export async function renderCalendarWidget(containerId, objectId = null, onDateSelect = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; color: var(--fg-dim); padding: 20px;">Загрузка...</div>';

    try {
        // Загружаем задачи (все или только по объекту)
        let query = db.from('tasks').select('*').not('deadline_start', 'is', null);
        if (objectId) {
            query = query.eq('object_id', objectId); // Предполагаем, что у задач есть object_id
        }
        const { data: tasks, error } = await query;
        if (error) throw error;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        let html = `
            <div style="background: var(--bg2); border-radius: 16px; padding: 15px; border: 1px solid var(--bg3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: var(--fg); font-size: 16px;">${monthNames[currentMonth]} ${currentYear}</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 11px; color: var(--fg-dim); margin-bottom: 8px;">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
        `;

        for (let i = 0; i < startDay; i++) {
            html += `<div></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksForDay = tasks.filter(t => t.deadline_start === dateStr);
            const hasTasks = tasksForDay.length > 0;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            let bgColor = 'var(--bg3)';
            let textColor = 'var(--fg)';
            if (hasTasks) {
                bgColor = 'var(--accent)';
                textColor = 'white';
            } else if (isToday) {
                bgColor = 'var(--bg2)';
                textColor = 'var(--accent)';
            }

            html += `
                <div onclick="window._calendarSelectDate('${dateStr}', '${containerId}', ${onDateSelect ? 'true' : 'false'})" 
                     style="padding: 8px 2px; border-radius: 8px; background: ${bgColor}; color: ${textColor}; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 36px; border: 1px solid var(--bg3); ${isToday ? 'border-color: var(--accent);' : ''}">
                    <span style="font-weight: ${hasTasks || isToday ? 'bold' : 'normal'}; font-size: 13px;">${day}</span>
                    ${hasTasks ? `<span style="font-size: 9px; opacity: 0.9;">${tasksForDay.length}</span>` : ''}
                </div>
            `;
        }

        html += `</div></div>`;
        container.innerHTML = html;

        // Глобальная функция для обработки клика
        window._calendarSelectDate = function(date, cid, hasCallback) {
            if (hasCallback && typeof window._calendarCallback === 'function') {
                window._calendarCallback(date);
            } else {
                window.showTasksForDate(date);
            }
        };

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; padding: 10px;">Ошибка календаря: ${err.message}</div>`;
    }
}
