import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export function openNewTask() {
    const container = document.getElementById('app-content');
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название *</label>
                <input type="text" id="new-task-title" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;" placeholder="Например: Приклеить плитку">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                <textarea id="new-task-desc" rows="2" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;" placeholder="Детали задачи..."></textarea>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Приоритет</label>
                <select id="new-task-priority" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                    <option value="low">Низкий</option>
                    <option value="medium" selected>Средний</option>
                    <option value="high">Высокий</option>
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <label style="color: var(--fg-dim);">Срок</label>
                    <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 2px;">
                        <button onclick="window.toggleNewTaskDeadlineType('single')" id="new-btn-single" style="padding: 4px 10px; border-radius: 10px; border: none; background: var(--accent); color: white; font-size: 12px; cursor: pointer;">Одна дата</button>
                        <button onclick="window.toggleNewTaskDeadlineType('range')" id="new-btn-range" style="padding: 4px 10px; border-radius: 10px; border: none; background: transparent; color: var(--fg-dim); font-size: 12px; cursor: pointer;">Диапазон</button>
                    </div>
                </div>
                <div id="new-deadline-single" style="display: block;">
                    <div id="new-task-deadline-start" onclick="window.openCustomCalendar('new-task')" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">${today.split('-').reverse().join('.')}</div>
                </div>
                <div id="new-deadline-range" style="display: none;">
                    <div style="display: flex; gap: 10px;">
                        <div id="new-task-deadline-start-range" onclick="window.openCustomCalendar('new-task-range')" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">Начало</div>
                        <div id="new-task-deadline-end" onclick="window.openCustomCalendar('new-task-end')" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; cursor: pointer; min-height: 42px; display: flex; align-items: center;">Конец</div>
                    </div>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px;">
                        <button onclick="window.setNewTaskQuickDate('today')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 11px; cursor: pointer;">Сегодня</button>
                        <button onclick="window.setNewTaskQuickDate('tomorrow')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 11px; cursor: pointer;">Завтра</button>
                        <button onclick="window.setNewTaskQuickDate('plus3')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 11px; cursor: pointer;">+3</button>
                        <button onclick="window.setNewTaskQuickDate('plus7')" style="padding: 6px 10px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 11px; cursor: pointer;">+7</button>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Фото</label>
                <input type="file" id="new-task-photo" accept="image/*" style="display: none;" onchange="window.handlePhotoAttach(this)">
                <button type="button" onclick="document.getElementById('new-task-photo').click()" style="padding: 10px 15px; border-radius: 8px; border: 1px dashed var(--fg-dim); background: transparent; color: var(--fg); cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>Прикрепить фото
                </button>
                <div id="photo-preview" style="margin-top: 10px; display: none;">
                    <img id="photo-img" style="max-width: 100px; border-radius: 8px;">
                </div>
            </div>

            <button onclick="window.saveNewTask()" style="width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">Сохранить</button>
            <button onclick="window.openTasks()" style="width: 100%; padding: 14px; background: transparent; color: var(--fg-dim); border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">Отмена</button>
        </div>
    `;
}

window.applyQuickDate = function(val) {
    if (!val) return;
    const d = new Date();
    if (val === 'tomorrow') { d.setDate(d.getDate() + 1); }
    else if (val === 'plus3') { d.setDate(d.getDate() + 3); }
    else if (val === 'plus7') { d.setDate(d.getDate() + 7); }
    document.getElementById('new-task-deadline-start').value = d.toISOString().split('T')[0];
    document.getElementById('new-task-quick-date').value = '';
};

window.handlePhotoAttach = function(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 3 * 1024 * 1024) {
            alert('Фото слишком большое (больше 3 МБ). Пожалуйста, выберите фото меньшего размера.');
            input.value = '';
            document.getElementById('photo-preview').style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-preview').style.display = 'block';
            document.getElementById('photo-img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
};

export async function saveNewTask() {
    const titleEl = document.getElementById('new-task-title');
    if (!titleEl) return alert('Ошибка формы');

    const title = titleEl.value.trim();
    if (!title) return alert('Введите название задачи!');

    const desc = document.getElementById('new-task-desc').value.trim();
    const priority = document.getElementById('new-task-priority').value;
    const single = document.getElementById('new-deadline-single');
    const isSingle = single ? single.style.display !== 'none' : true;
    let dateStart = null;
    let dateEnd = null;
    if (isSingle) {
        const el = document.getElementById('new-task-deadline-start');
        if (el && el.textContent !== 'Выберите дату') {
            const p = el.textContent.trim().split('.');
            if (p.length === 3) dateStart = p[2] + '-' + p[1] + '-' + p[0];
        }
    } else {
        const elStart = document.getElementById('new-task-deadline-start-range');
        const elEnd = document.getElementById('new-task-deadline-end');
        if (elStart && elStart.textContent !== 'Начало') {
            const p = elStart.textContent.trim().split('.');
            if (p.length === 3) dateStart = p[2] + '-' + p[1] + '-' + p[0];
        }
        if (elEnd && elEnd.textContent !== 'Конец') {
            const p = elEnd.textContent.trim().split('.');
            if (p.length === 3) dateEnd = p[2] + '-' + p[1] + '-' + p[0];
        }
    }

    let photoUrl = null;
    const photoInput = document.getElementById('new-task-photo');

    if (photoInput && photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const fileName = `task_${Date.now()}_${file.name.replace(/\s/g, '_')}`;

        try {
            const { data, error } = await db.storage.from('photos').upload(fileName, file);
            if (error) throw error;
            const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
        } catch (err) {
            console.error('Ошибка фото:', err);
            alert('Фото не загрузилось: ' + err.message);
        }
    }

    try {
        const { error } = await db.from('tasks').insert([{
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: dateStart || null,
            deadline_end: dateEnd || null,
            status: 'active',
            photo_url: photoUrl
        }]);

        if (error) throw error;
        window.openTasks();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
}

window.openNewTask = openNewTask;
window.saveNewTask = saveNewTask;

window.toggleNewTaskDeadlineType = function(type) {
    const single = document.getElementById('new-deadline-single');
    const range = document.getElementById('new-deadline-range');
    const btnSingle = document.getElementById('new-btn-single');
    const btnRange = document.getElementById('new-btn-range');
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
