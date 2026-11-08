window._modalCalYear = new Date().getFullYear();
window._modalCalMonth = new Date().getMonth();
window._modalCalSelected = null;

export function renderModalCalendar(selectedDate) {
    if (selectedDate) {
        const d = new Date(selectedDate);
        if (!isNaN(d)) {
            window._modalCalYear = d.getFullYear();
            window._modalCalMonth = d.getMonth();
            window._modalCalSelected = selectedDate;
        }
    }

    const container = document.getElementById('modal-calendar-container');
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
        if (isSelected) { bg = 'var(--accent)'; color = 'white'; }
        else if (isToday) { bg = 'var(--bg3)'; }

        html += `<div onclick="window.selectModalDate('${dateStr}')" style="padding: 8px 0; border-radius: 50%; background: ${bg}; color: ${color}; cursor: pointer; font-size: 13px; text-align: center;">${day}</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

export function changeModalMonth(delta) {
    window._modalCalMonth += delta;
    if (window._modalCalMonth < 0) { window._modalCalMonth = 11; window._modalCalYear--; }
    if (window._modalCalMonth > 11) { window._modalCalMonth = 0; window._modalCalYear++; }
    window.renderModalCalendar();
}

export function selectModalDate(dateStr) {
    window._modalCalSelected = dateStr;
    document.getElementById('modal-field-input').value = dateStr;
    window.renderModalCalendar();
}

export function setModalQuickDate(type) {
    const d = new Date();
    if (type === 'today') { /* nothing */ }
    else if (type === 'tomorrow') { d.setDate(d.getDate() + 1); }
    else if (type === 'plus3') { d.setDate(d.getDate() + 3); }
    else if (type === 'plus7') { d.setDate(d.getDate() + 7); }
    const dateStr = d.toISOString().split('T')[0];
    window._modalCalSelected = dateStr;
    document.getElementById('modal-field-input').value = dateStr;
    window.renderModalCalendar(dateStr);
}

window.renderModalCalendar = renderModalCalendar;
window.changeModalMonth = changeModalMonth;
window.selectModalDate = selectModalDate;
window.setModalQuickDate = setModalQuickDate;
