import { db } from '../api/supabase.js';

export async function renderCalendar() {
    if (window.setNavActive) window.setNavActive('calendar');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка календаря...</div>';

    try {
        // Получаем все задачи с датой
        const { data: tasks, error } = await db.from('tasks').select('*').not('deadline_start', 'is', null);
        if (error) throw error;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
        const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Сдвигаем, чтобы неделя начиналась с Понедельника

        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: var(--fg); text-align: center; margin-bottom: 20px;">${monthNames[currentMonth]} ${currentYear}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-size: 12px; color: var(--fg-dim); margin-bottom: 10px;">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
        `;

        // Пустые ячейки до начала месяца
        for (let i = 0; i < startDay; i++) {
            html += `<div></div>`;
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksForDay = tasks.filter(t => t.deadline_start === dateStr);
            const hasTasks = tasksForDay.length > 0;

            html += `
                <div onclick="window.showTasksForDate('${dateStr}')" style="padding: 10px 5px; border-radius: 8px; background: ${hasTasks ? 'var(--accent)' : 'var(--bg2)'}; color: ${hasTasks ? 'white' : 'var(--fg)'}; cursor: pointer; border: 1px solid var(--bg3); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40px;">
                    <span style="font-weight: ${hasTasks ? 'bold' : 'normal'};">${day}</span>
                    ${hasTasks ? `<span style="font-size: 10px; opacity: 0.8;">${tasksForDay.length}</span>` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки: ${err.message}</div>`;
    }
}

// Функция для показа задач на конкретный день
window.showTasksForDate = async function(dateStr) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').eq('deadline_start', dateStr);
        if (error) throw error;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <button onclick="window.openCalendar()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад к календарю</button>
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
