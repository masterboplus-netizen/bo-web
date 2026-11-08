import { db } from '../api/supabase.js';

export async function openEditField(field, currentValue, taskId) {
    // Локальная функция для переключения типа срока
    window.toggleDeadlineType = function(type) {
        const single = document.getElementById('deadline-single');
        const range = document.getElementById('deadline-range');
        const btnSingle = document.getElementById('btn-single');
        const btnRange = document.getElementById('btn-range');
        if (type === 'single') {
            if (single) single.style.display = 'block';
            if (range) range.style.display = 'none';
            if (btnSingle) { btnSingle.style.background = 'var(--accent)'; btnSingle.style.color = 'white'; }
            if (btnRange) { btnRange.style.background = 'transparent'; btnRange.style.color = 'var(--fg-dim)'; }
        } else {
            if (single) single.style.display = 'none';
            if (range) range.style.display = 'block';
            if (btnRange) { btnRange.style.background = 'var(--accent)'; btnRange.style.color = 'white'; }
            if (btnSingle) { btnSingle.style.background = 'transparent'; btnSingle.style.color = 'var(--fg-dim)'; }
        }
    };

    if (currentValue && typeof currentValue === 'string' && currentValue.includes('T')) {
        currentValue = currentValue.substring(0, 10);
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; max-height: 80vh; overflow-y: auto; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box;';

    let fieldLabel = '';
    let fieldHtml = '';

    if (field === 'description') {
        fieldLabel = 'Описание';
        fieldHtml = '<textarea id="modal-field-input" rows="4" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">' + currentValue + '</textarea>';
    } else if (field === 'deadline') {
        fieldLabel = 'Плановый срок';
        fieldHtml = `
            <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 2px; margin-bottom: 15px;">
                <button onclick="window.toggleDeadlineType('single')" id="btn-single" style="flex: 1; padding: 8px; border-radius: 10px; border: none; background: ${!currentValue.includes(' - ') ? 'var(--accent)' : 'transparent'}; color: ${!currentValue.includes(' - ') ? 'white' : 'var(--fg-dim)'}; font-size: 13px; cursor: pointer;">Одна дата</button>
                <button onclick="window.toggleDeadlineType('range')" id="btn-range" style="flex: 1; padding: 8px; border-radius: 10px; border: none; background: ${currentValue.includes(' - ') ? 'var(--accent)' : 'transparent'}; color: ${currentValue.includes(' - ') ? 'white' : 'var(--fg-dim)'}; font-size: 13px; cursor: pointer;">Диапазон</button>
            </div>

            <div id="deadline-single" style="display: ${!currentValue.includes(' - ') ? 'block' : 'none'}; margin-bottom: 15px;">
                <div id="modal-deadline-start" onclick="window.openCustomCalendar('start')" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">${currentValue ? currentValue.split(' - ')[0].split('-').reverse().join('.') : 'Выберите дату'}</div>
            </div>
            <div id="deadline-range" style="display: ${currentValue.includes(' - ') ? 'block' : 'none'}; margin-bottom: 15px;">
                <div style="display: flex; gap: 10px;">
                    <div id="modal-deadline-start-range" onclick="window.openCustomCalendar('start-range')" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">${currentValue ? currentValue.split(' - ')[0].split('-').reverse().join('.') : 'Начало'}</div>
                    <div id="modal-deadline-end" onclick="window.openCustomCalendar('end')" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">${currentValue && currentValue.split(' - ')[1] ? currentValue.split(' - ')[1].split('-').reverse().join('.') : 'Конец'}</div>
                </div>
            </div>

            <div id="modal-calendar-container" style="margin-bottom: 15px;"></div>
            <input type="hidden" id="modal-field-input" value="${currentValue}">
            <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                <button onclick="window.setModalQuickDate('today')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Сегодня</button>
                <button onclick="window.setModalQuickDate('tomorrow')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Завтра</button>
                <button onclick="window.setModalQuickDate('plus3')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+3 дня</button>
                <button onclick="window.setModalQuickDate('plus7')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+7 дней</button>
            </div>
        `;
    } else if (field === 'priority') {
        fieldLabel = 'Приоритет';
        fieldHtml = `
            <div id="priority-buttons" style="display: flex; flex-direction: column; gap: 8px;">
                <button type="button" onclick="window._selectPriority('low', ${taskId})" id="prio-btn-low" style="padding: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: ${currentValue === 'low' ? 'var(--accent)' : 'var(--bg2)'}; color: ${currentValue === 'low' ? 'white' : 'var(--fg)'}; font-size: 15px; cursor: pointer; text-align: left; padding-left: 16px;">Низкий</button>
                <button type="button" onclick="window._selectPriority('medium', ${taskId})" id="prio-btn-medium" style="padding: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: ${currentValue === 'medium' ? 'var(--accent)' : 'var(--bg2)'}; color: ${currentValue === 'medium' ? 'white' : 'var(--fg)'}; font-size: 15px; cursor: pointer; text-align: left; padding-left: 16px;">Средний</button>
                <button type="button" onclick="window._selectPriority('high', ${taskId})" id="prio-btn-high" style="padding: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: ${currentValue === 'high' ? 'var(--accent)' : 'var(--bg2)'}; color: ${currentValue === 'high' ? 'white' : 'var(--fg)'}; font-size: 15px; cursor: pointer; text-align: left; padding-left: 16px;">Высокий</button>
            </div>
            <input type="hidden" id="modal-field-input" value="${currentValue}">
        `;
    }

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: var(--fg); font-size: 16px;">${fieldLabel}</h3>
        </div>
        <div style="margin-bottom: 15px;">
            ${fieldHtml}
        </div>
        ${field === 'deadline' ? `<button onclick="window.saveEditField('deadline', ${taskId})" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 5px;">Сохранить</button>` : ''}
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            if (field === 'description' || field === 'deadline') {
                window.saveEditField(field, taskId);
            } else {
                overlay.remove();
            }
        }
    };

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
        if (field === 'deadline') {
                    }
    }, 10);

    function close() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

        overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

export async function saveEditField(field, taskId) {
    const value = document.getElementById('modal-field-input').value;

    try {
        const updateData = {};
        if (field === 'description') updateData.description = value || null;
        else if (field === 'deadline') {
            const single = document.getElementById('deadline-single');
            const isSingle = single ? single.style.display !== 'none' : true;
            if (isSingle) {
                const startEl = document.getElementById('modal-deadline-start');
                const start = startEl ? startEl.textContent.trim() : '';
                updateData.deadline_start = start || null;
                updateData.deadline_end = null;
            } else {
                const startEl = document.getElementById('modal-deadline-start-range');
                const start = startEl ? startEl.textContent.trim() : '';
                const endEl = document.getElementById('modal-deadline-end');
                const end = endEl ? endEl.textContent.trim() : '';
                updateData.deadline_start = start || null;
                updateData.deadline_end = end || null;
            }
        }
        else if (field === 'priority') updateData.priority = value;

        const { error } = await db.from('tasks').update(updateData).eq('id', taskId);
        if (error) throw error;

        const overlay = document.querySelector('div[style*="z-index: 100000"]');
        if (overlay) overlay.remove();

        window.openTaskDetail(taskId);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
}

window.openEditField = openEditField;
window.saveEditField = saveEditField;

window._selectPriority = async function(priority, taskId) {
    try {
        const { error } = await db.from('tasks').update({ priority: priority }).eq('id', taskId);
        if (error) throw error;

        const overlay = document.querySelector('div[style*="z-index: 100000"]');
        if (overlay) overlay.remove();

        window.openTaskDetail(taskId);
    } catch (err) {
        alert('Ошибка сохранения приоритета: ' + err.message);
    }
};
