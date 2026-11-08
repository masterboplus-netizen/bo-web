import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderTasks() {
    if (window.setNavActive) window.setNavActive('tasks');
    const container = document.getElementById('app-content');
    let html = '';
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
            return;
        }

        html = '<div style="padding: 10px; max-width: 600px; margin: 0 auto;">';
        tasks.forEach(task => {
            let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
            let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';
            
            let deadlineDisplay = '';
            if (task.deadline_start) {
                deadlineDisplay = new Date(task.deadline_start).toLocaleDateString('ru-RU');
                if (task.deadline_end) {
                    deadlineDisplay += ` — ${new Date(task.deadline_end).toLocaleDateString('ru-RU')}`;
                }
            }

            html += `
                <div onclick="window.openTaskDetail(${task.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--bg3); cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-weight: bold; font-size: 16px; color: var(--fg); word-break: break-word;">${escapeHtml(task.title || 'Без названия')}</div>
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; white-space: nowrap; margin-left: 10px;">${statusText}</span>
                    </div>
                    ${task.description ? `<div style="font-size: 14px; color: var(--fg-dim); word-break: break-word;">${escapeHtml(task.description)}</div>` : ''}
                    ${deadlineDisplay ? `<div style="font-size: 12px; color: var(--fg-dim);">Срок: ${deadlineDisplay}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--fg-dim); margin-top: 5px;">
                        <span>ID: ${task.id}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span>${new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки задач: ${err.message}</div>`;
    }
}

export function openNewTask() {
    const container = document.getElementById('app-content');
    container.innerHTML = '';
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
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Срок</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="date" id="new-task-deadline-start" value="${today}" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <select id="new-task-quick-date" onchange="window.applyQuickDate(this.value)" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; max-width: 100px;">
                        <option value="">Быстро...</option>
                        <option value="today">Сегодня</option>
                        <option value="tomorrow">Завтра</option>
                        <option value="plus3">+3 дня</option>
                        <option value="plus7">+7 дней</option>
                    </select>
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
    const dateStart = document.getElementById('new-task-deadline-start').value;

    let photoUrl = null;
    const photoInput = document.getElementById('new-task-photo');

    if (photoInput && photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const fileName = `task_${Date.now()}_${file.name.replace(/\s/g, '_')}`;

        try {
            const { data, error } = await db.storage.from('photos').upload(fileName, file);
            if (error) {
                console.error('Ошибка Storage:', error);
                throw new Error(error.message || 'Failed to fetch');
            }
            const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
        } catch (err) {
            console.error('Ошибка фото:', err);
            if (err.message !== 'Failed to fetch') {
                alert('Фото не загрузилось: ' + err.message);
            }
        }
    }

    try {
        const { error } = await db.from('tasks').insert([{
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: dateStart || null,
            status: 'active',
            photo_url: photoUrl
        }]);

        if (error) throw error;
        window.openTasks();
    } catch (err) {
        console.error('Ошибка БД:', err);
        alert('Ошибка сохранения: ' + err.message);
    }
}





// === МЕНЮ ДЕЙСТВИЙ (ТРИ ТОЧКИ) ===




window.setQuickDate = function(type) {
    const today = new Date();
    let targetDate = new Date(today);

    if (type === 'tomorrow') targetDate.setDate(today.getDate() + 1);
    else if (type === 'plus3') targetDate.setDate(today.getDate() + 3);
    else if (type === 'plus7') targetDate.setDate(today.getDate() + 7);

    const dateStr = targetDate.toISOString().split('T')[0];

    const singleInput = document.getElementById('edit-task-deadline-start');
    const rangeStart = document.getElementById('edit-task-deadline-start-range');
    const rangeEnd = document.getElementById('edit-task-deadline-end');

    // Подсветка нажатой кнопки
    const btn = document.querySelector(`button[onclick="window.setQuickDate('${type}')"]`);
    if (btn) {
        const originalBg = btn.style.background;
        const originalColor = btn.style.color;
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.style.background = originalBg;
            btn.style.color = originalColor;
        }, 300);
    }

    if (singleInput && singleInput.offsetParent !== null) {
        singleInput.value = dateStr;
    } else if (rangeStart && rangeEnd) {
        if (!rangeStart.value) {
            rangeStart.value = dateStr;
        } else {
            rangeEnd.value = dateStr;
        }
    }
};


window.toggleTaskStatus = async function(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'active' : 'done';
    try {
        const { error } = await db.from('tasks').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        window.openTaskDetail(id);
    } catch (err) {
        alert('Ошибка обновления статуса: ' + err.message);
    }
};


