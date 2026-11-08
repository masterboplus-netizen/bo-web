window._modalCalYear = new Date().getFullYear();
window._modalCalMonth = new Date().getMonth();
window._modalCalSelected = null;
window._modalCalMode = 'single'; // 'single' или 'range'
window._modalCalRangeStart = null;
window._modalCalRangeEnd = null;

export function openCustomCalendar(mode) {
    window._modalCalMode = (mode === 'end' || mode === 'start-range' || mode === 'range') ? 'range' : 'single';
    window._modalCalSelected = null;
    window._modalCalRangeStart = null;
    window._modalCalRangeEnd = null;

    const overlay = document.createElement('div');
    overlay.id = 'custom-calendar-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 100001; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box; transform: scale(0.95); transition: transform 0.2s ease;';

    modal.innerHTML = `
        <div id="calendar-container"></div>
        ${window._modalCalMode === 'range' ? '<button onclick="window.saveRangeFromCalendar()" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 15px;">Сохранить</button>' : ''}
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    renderCalendar();
}

export function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const year = window._modalCalYear;
    const month = window._modalCalMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <button onclick="window.changeModalMonth(-1)" style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer; padding: 5px 10px;"><</button>
            <span style="color: var(--fg); font-weight: bold; font-size: 15px;">${monthNames[month]} ${year}</span>
            <button onclick="window.changeModalMonth(1)" style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer; padding: 5px 10px;">></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 11px; color: var(--fg-dim); margin-bottom: 5px;">
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
    `;

    for (let i = 0; i < startDay; i++) html += `<div></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = dateStr === window._modalCalSelected;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        let bg = 'transparent';
        let color = 'var(--fg)';
        
        if (window._modalCalMode === 'range') {
            if (window._modalCalRangeStart && window._modalCalRangeEnd) {
                if (dateStr >= window._modalCalRangeStart && dateStr <= window._modalCalRangeEnd) {
                    bg = 'rgba(0,122,255,0.3)';
                    color = 'white';
                }
            }
            if (dateStr === window._modalCalRangeStart || dateStr === window._modalCalRangeEnd) {
                bg = 'var(--accent)';
                color = 'white';
            }
        } else if (isSelected) {
            bg = 'var(--accent)';
            color = 'white';
        } else if (isToday) {
            bg = 'var(--bg3)';
        }

        html += `<div onclick="window.handleCalendarDayClick('${dateStr}')" style="padding: 8px 0; border-radius: 50%; background: ${bg}; color: ${color}; cursor: pointer; font-size: 13px; text-align: center;">${day}</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

export function handleCalendarDayClick(dateStr) {
    const formatted = dateStr.split('-').reverse().join('.');
    if (window._modalCalMode === 'single') {
        const singleInput = document.getElementById('modal-deadline-start');
        if (singleInput) singleInput.textContent = formatted;
        const startRange = document.getElementById('modal-deadline-start-range');
        if (startRange) startRange.textContent = formatted;
        const overlay = document.getElementById('custom-calendar-overlay');
        if (overlay) overlay.remove();
    } else {
        if (!window._modalCalRangeStart) {
            window._modalCalRangeStart = dateStr;
            window._modalCalRangeEnd = null;
        } else if (!window._modalCalRangeEnd) {
            if (dateStr < window._modalCalRangeStart) {
                window._modalCalRangeEnd = window._modalCalRangeStart;
                window._modalCalRangeStart = dateStr;
            } else {
                window._modalCalRangeEnd = dateStr;
            }
        } else {
            window._modalCalRangeStart = dateStr;
            window._modalCalRangeEnd = null;
        }
        renderCalendar();
    }
}

export function saveRangeFromCalendar() {
    if (window._modalCalRangeStart && window._modalCalRangeEnd) {
        const startInput = document.getElementById('modal-deadline-start-range');
        const endInput = document.getElementById('modal-deadline-end');
        if (startInput) startInput.textContent = window._modalCalRangeStart.split('-').reverse().join('.');
        if (endInput) endInput.textContent = window._modalCalRangeEnd.split('-').reverse().join('.');
    }
    const overlay = document.getElementById('custom-calendar-overlay');
    if (overlay) overlay.remove();
}

export function changeModalMonth(delta) {
    window._modalCalMonth += delta;
    if (window._modalCalMonth < 0) { window._modalCalMonth = 11; window._modalCalYear--; }
    if (window._modalCalMonth > 11) { window._modalCalMonth = 0; window._modalCalYear++; }
    renderCalendar();
}

window.openCustomCalendar = openCustomCalendar;
window.renderCalendar = renderCalendar;
window.handleCalendarDayClick = handleCalendarDayClick;
window.saveRangeFromCalendar = saveRangeFromCalendar;
window.changeModalMonth = changeModalMonth;

export function setModalQuickDate(type) {
    const d = new Date();
    if (type === 'today') { /* nothing */ }
    else if (type === 'tomorrow') { d.setDate(d.getDate() + 1); }
    else if (type === 'plus3') { d.setDate(d.getDate() + 3); }
    else if (type === 'plus7') { d.setDate(d.getDate() + 7); }
    const dateStr = d.toISOString().split('T')[0];
    const formatted = dateStr.split('-').reverse().join('.');
    
    const single = document.getElementById('deadline-single');
    const isSingle = single ? single.style.display !== 'none' : true;
    
    if (isSingle) {
        const input = document.getElementById('modal-deadline-start');
        if (input) input.textContent = formatted;
    } else {
        const start = document.getElementById('modal-deadline-start-range');
        const end = document.getElementById('modal-deadline-end');
        if (start && (start.textContent === 'Начало' || !start.textContent)) start.textContent = formatted;
        else if (end) end.textContent = formatted;
    }
}
window.setModalQuickDate = setModalQuickDate;
