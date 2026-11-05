import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderTasks() {
    if (window.setNavActive) window.setNavActive('tasks');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
            return;
        }

        let html = '<div style="padding: 10px; max-width: 600px; margin: 0 auto;">';
        tasks.forEach(task => {
            let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
            let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';

            html += `
                <div onclick="window.openTaskDetail(${task.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--bg3); cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-weight: bold; font-size: 16px; color: var(--fg); word-break: break-word;">${escapeHtml(task.title || 'Без названия')}</div>
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; white-space: nowrap; margin-left: 10px;">${statusText}</span>
                    </div>
                    ${task.description ? `<div style="font-size: 14px; color: var(--fg-dim); word-break: break-word;">${escapeHtml(task.description)}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--fg-dim); margin-top: 5px;">
                        <span>ID: ${task.id}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span>${new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
                            <button onclick="event.stopPropagation(); window.deleteTask(${task.id})" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; font-size: 16px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
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
            <h2 style="color: var(--fg); margin-bottom: 20px;">Новая задача</h2>

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

window.deleteTask = async function(id) {
    if (!confirm('Удалить задачу?')) return;
    try {
        const { error } = await db.from('tasks').delete().eq('id', id);
        if (error) throw error;
        window.openTasks();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};

window.openTaskDetail = async function(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: task, error } = await db.from('tasks').select('*').eq('id', id).single();
        if (error) throw error;

        const { data: photos, error: photosError } = await db.from('task_photos').select('*').eq('task_id', id).order('created_at', { ascending: false });
        if (photosError) throw photosError;

        let html = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
                <button onclick="window.openTasks()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад к списку</button>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название</label>
                        <input type="text" id="edit-task-title" value="${escapeHtml(task.title || '')}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
                    </div>

                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                        <textarea id="edit-task-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;">${escapeHtml(task.description || '')}</textarea>
                    </div>

                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Приоритет</label>
                        <select id="edit-task-priority" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Низкий</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Средний</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Высокий</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Срок</label>
                        <input type="date" id="edit-task-deadline" value="${task.deadline_start || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    </div>

                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Статус</label>
                        <select id="edit-task-status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                            <option value="active" ${task.status === 'active' ? 'selected' : ''}>В работе</option>
                            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Выполнена</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Фотографии (${photos ? photos.length : 0})</label>
                        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
                            ${photos && photos.length > 0 ? photos.map(p => `
                                <div style="position: relative; flex-shrink: 0; width: 120px;">
                                    <img src="${p.photo_url}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
                                    <div style="font-size: 10px; color: var(--fg-dim); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title || 'Без названия'}</div>
                                    <div style="font-size: 9px; color: var(--fg-dim);">${new Date(p.created_at).toLocaleDateString('ru-RU')}</div>
                                    <button onclick="window.deleteTaskPhoto(${p.id}, ${task.id})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                                </div>
                            `).join('') : '<div style="color: var(--fg-dim); font-size: 12px;">Нет фото</div>'}
                            <div onclick="document.getElementById('task-photo-upload').click()" style="width: 120px; height: 120px; border: 2px dashed var(--bg3); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; color: var(--fg-dim);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span style="font-size: 10px; margin-top: 5px;">Добавить</span>
                            </div>
                        </div>
                        <input type="file" id="task-photo-upload" accept="image/*" style="display: none;" onchange="window.uploadTaskPhoto(${task.id}, this)">
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="window.saveTaskChanges(${task.id})" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">
                            Сохранить
                        </button>
                        <button onclick="window.deleteTask(${task.id})" style="padding: 14px 20px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
};

window.uploadTaskPhoto = async function(taskId, input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    
    try {
        const fileName = `task_${taskId}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await db.storage.from('photos').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
        
        const title = prompt('Введите название фото (необязательно):');
        
        const { error: dbError } = await db.from('task_photos').insert([{
            task_id: taskId,
            photo_url: urlData.publicUrl,
            title: title || null
        }]);
        if (dbError) throw dbError;
        
        window.openTaskDetail(taskId);
    } catch (err) {
        alert('Ошибка загрузки фото: ' + err.message);
    }
};

window.deleteTaskPhoto = async function(photoId, taskId) {
    if (!confirm('Удалить фото?')) return;
    try {
        const { error } = await db.from('task_photos').delete().eq('id', photoId);
        if (error) throw error;
        window.openTaskDetail(taskId);
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};

window.saveTaskChanges = async function(id) {
    const title = document.getElementById('edit-task-title').value.trim();
    const desc = document.getElementById('edit-task-desc').value.trim();
    const priority = document.getElementById('edit-task-priority').value;
    const deadline = document.getElementById('edit-task-deadline').value;
    const status = document.getElementById('edit-task-status').value;

    if (!title) return alert('Название не может быть пустым!');

    try {
        const { error } = await db.from('tasks').update({
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: deadline || null,
            status: status
        }).eq('id', id);

        if (error) throw error;
        window.openTaskDetail(id);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
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
