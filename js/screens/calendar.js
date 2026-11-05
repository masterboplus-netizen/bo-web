export function renderCalendar() {
    if (window.setNavActive) window.setNavActive('calendar');
    const container = document.getElementById('app-content');

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let currentView = 'month';

    function render() {
        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
                
                <div style="display: flex; background: var(--bg2); border-radius: 20px; padding: 4px; margin-bottom: 20px;">
                    <button onclick="window.switchCalView('month')" id="cal-btn-month" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: var(--accent); color: white; font-weight: bold; cursor: pointer;">Месяц</button>
                    <button onclick="window.switchCalView('year')" id="cal-btn-year" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">Год</button>
                    <button onclick="window.switchCalView('30days')" id="cal-btn-30days" style="flex: 1; padding: 10px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">30 дней</button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px;">
                    <button onclick="window.changeMonth(-1)" style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer;">&lt;</button>
                    <h2 id="cal-title" style="color: var(--fg); margin: 0; font-size: 18px;"></h2>
                    <button onclick="window.changeMonth(1)" style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer;">&gt;</button>
                </div>

                <div id="cal-grid"></div>

                <div id="cal-day-details" style="margin-top: 20px; display: none;">
                    <h3 id="cal-day-title" style="color: var(--fg-dim); font-size: 14px; margin-bottom: 10px;"></h3>
                    <div id="cal-day-events" style="color: var(--fg-dim); font-size: 14px;">Событий пока нет.</div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        renderGrid();
    }

    function renderGrid() {
        const grid = document.getElementById('cal-grid');
        const title = document.getElementById('cal-title');

        document.querySelectorAll('[id^="cal-btn-"]').forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--fg-dim)';
        });
        document.getElementById(`cal-btn-${currentView}`).style.background = 'var(--accent)';
        document.getElementById(`cal-btn-${currentView}`).style.color = 'white';

        if (currentView === 'year') {
            title.textContent = `${currentYear} год`;
            grid.innerHTML = renderYearGrid(currentYear);
        } else if (currentView === '30days') {
            title.textContent = `Ближайшие 30 дней`;
            grid.innerHTML = render30DaysGrid();
        } else {
            title.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
            grid.innerHTML = renderMonthGrid(currentYear, currentMonth);
        }
    }

    function renderMonthGrid(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        let html = `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-size: 12px; color: var(--fg-dim); margin-bottom: 10px;">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
        `;

        for (let i = 0; i < startDay; i++) html += `<div></div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            html += `
                <div onclick="window.showDay('${dateStr}', '${day} ${getMonthName(month)} ${year}')" style="padding: 10px 5px; border-radius: 50%; background: ${isToday ? 'var(--bg3)' : 'transparent'}; color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 40px; aspect-ratio: 1;">
                    <span style="font-size: 14px; font-weight: ${isToday ? 'bold' : 'normal'};">${day}</span>
                </div>
            `;
        }
        html += `</div>`;
        return html;
    }

    
    function renderYearGrid(year) {
        let html = `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 5px 0;">`;
        
        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            const firstDayIndex = new Date(year, m, 1).getDay();
            const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
            const monthName = getMonthName(m).substring(0, 3);

            let monthHtml = `
                <div style="background: var(--bg2); border-radius: 8px; padding: 6px; border: 1px solid var(--bg3);">
                    <div style="text-align: center; color: var(--fg); font-size: 11px; font-weight: bold; margin-bottom: 4px;">${monthName}</div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; text-align: center; font-size: 7px; color: var(--fg-dim);">
                        <div>П</div><div>В</div><div>С</div><div>Ч</div><div>П</div><div>С</div><div>В</div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; text-align: center; font-size: 8px; color: var(--fg); margin-top: 2px;">
            `;

            for (let i = 0; i < startDay; i++) monthHtml += `<div></div>`;

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                monthHtml += `<div style="padding: 1px 0; ${isToday ? 'background: var(--accent); color: white; border-radius: 50%;' : ''}">${day}</div>`;
            }

            monthHtml += `</div></div>`;
            html += monthHtml;
        }

        html += `</div>`;
        return html;
    }


    
    function render30DaysGrid() {
        // Берем текущий месяц и год, чтобы отрисовать его сетку
        const year = currentYear;
        const month = currentMonth;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        let html = `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-size: 12px; color: var(--fg-dim); margin-bottom: 10px;">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
        `;

        for (let i = 0; i < startDay; i++) html += `<div></div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            html += `
                <div onclick="window.showDay('${dateStr}', '${day} ${getMonthName(month)} ${year}')" style="padding: 10px 5px; border-radius: 50%; background: ${isToday ? 'var(--bg3)' : 'transparent'}; color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 40px; aspect-ratio: 1;">
                    <span style="font-size: 14px; font-weight: ${isToday ? 'bold' : 'normal'};">${day}</span>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }


    function getMonthName(monthIndex) {
        const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        return months[monthIndex];
    }

    window.switchCalView = function(view) {
        currentView = view;
        renderGrid();
    };

    window.changeMonth = function(delta) {
        currentMonth += delta;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderGrid();
    };

    window.showDay = function(dateStr, displayDate) {
        const details = document.getElementById('cal-day-details');
        document.getElementById('cal-day-title').textContent = displayDate;
        document.getElementById('cal-day-events').innerHTML = 'Событий пока нет.';
        details.style.display = 'block';
        details.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    render();
}
