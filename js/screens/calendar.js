import { db } from '../api/supabase.js';

export async function renderCalendar() {
    if (window.setNavActive) window.setNavActive('calendar');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка календаря...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*');
        if (error) throw error;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
                
                <!-- Переключатель режимов -->
                <div style="display: flex; background: var(--bg2); border-radius: 20px; padding: 4px; margin-bottom: 20px;">
                    <button onclick="window.switchCalendarView('month')" id="btn-month" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: var(--accent); color: white; font-weight: bold; cursor: pointer;">Месяц</button>
                    <button onclick="window.switchCalendarView('year')" id="btn-year" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">Год</button>
                    <button onclick="window.switchCalendarView('30days')" id="btn-30days" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">30 дней</button>
                </div>

                <!-- Заголовок с годом/месяцем -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px;">
                    <button style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer;">&lt;</button>
                    <h2 style="color: var(--fg); margin: 0; font-size: 18px;">Ноябрь 2026</h2>
                    <button style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer;">&gt;</button>
                </div>

                <!-- Сетка календаря -->
                <div id="calendar-grid-container">
                    <!-- Сюда будет рендериться календарь -->
                </div>

                <!-- Блок под календарем (Сессии/24ч) -->
                <div style="display: flex; background: var(--bg2); border-radius: 20px; padding: 4px; margin-top: 20px;">
                    <button style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: var(--accent); color: white; font-weight: bold; cursor: pointer;">Сессии</button>
                    <button style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">24ч</button>
                </div>

                <!-- Список выбранного дня -->
                <div id="calendar-day-details" style="margin-top: 20px;">
                    <h3 style="color: var(--fg-dim); font-size: 14px; margin-bottom: 10px;">4 НОЯБРЯ 2026, СР</h3>
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="color: var(--fg-dim); font-size: 14px;">16:45 → 23:35 · 6ч 50м</div>
                        <div style="color: var(--accent); font-size: 14px; margin-top: 5px;">📷 90 📄 30 ✅ 2</div>
                    </div>
                </div>

            </div>
        `;
        container.innerHTML = html;

        // Инициализация отрисовки сетки месяца
        window.renderMonthGrid(currentYear, currentMonth, tasks);

        // Логика переключения видов (заглушка для теста)
        window.switchCalendarView = function(view) {
            document.querySelectorAll('[id^="btn-"]').forEach(btn => {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--fg-dim)';
            });
            document.getElementById(`btn-${view}`).style.background = 'var(--accent)';
            document.getElementById(`btn-${view}`).style.color = 'white';
            
            const grid = document.getElementById('calendar-grid-container');
            if (view === 'month') {
                window.renderMonthGrid(currentYear, currentMonth, tasks);
            } else {
                grid.innerHTML = '<div style="text-align: center; color: var(--fg-dim); padding: 20px;">Режим в разработке</div>';
            }
        };

        // Функция отрисовки сетки месяца
        window.renderMonthGrid = function(year, month, tasks) {
            const grid = document.getElementById('calendar-grid-container');
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayIndex = new Date(year, month, 1).getDay();
            const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Пн = 0

            let html = `
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-size: 12px; color: var(--fg-dim); margin-bottom: 10px;">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
            `;

            for (let i = 0; i < startDay; i++) {
                html += `<div></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const tasksForDay = tasks.filter(t => t.deadline_start === dateStr);
                const hasTasks = tasksForDay.length > 0;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                html += `
                    <div style="padding: 10px 5px; border-radius: 50%; background: ${isToday ? 'var(--bg3)' : 'transparent'}; color: var(--fg); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40px; aspect-ratio: 1;">
                        <span style="font-size: 14px;">${day}</span>
                        ${hasTasks ? `<span style="width: 4px; height: 4px; background: var(--accent); border-radius: 50%; margin-top: 2px;"></span>` : ''}
                    </div>
                `;
            }

            html += `</div>`;
            grid.innerHTML = html;
        };

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}
