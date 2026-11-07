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

        const { data: logs, error: logsError } = await db.from('task_progress').select('*').eq('task_id', id).order('created_at', { ascending: false });
        if (logsError) throw logsError;

        let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
        let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';
        
        let deadlineDisplay = 'Не указан';
        if (task.deadline_start) {
            deadlineDisplay = new Date(task.deadline_start).toLocaleDateString('ru-RU');
            if (task.deadline_end) {
                deadlineDisplay += ` — ${new Date(task.deadline_end).toLocaleDateString('ru-RU')}`;
            }
        }

        let html = `
            <div style="padding: 10px 20px 20px 20px; max-width: 600px; margin: 0 auto; padding-bottom: 120px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button onclick="window.openTasks()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button onclick="window.openTaskActions(${task.id}, '${escapeHtml(task.title)}')" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <!-- ОСНОВНАЯ ИНФОРМАЦИЯ -->
                    <div>
                        <h2 style="margin: 0 0 10px 0; color: var(--fg); font-size: 24px;">${escapeHtml(task.title)}</h2>
                        <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${statusText}</span>
                    </div>

                    ${task.description ? `
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Описание</div>
                        <div style="color: var(--fg); font-size: 15px; line-height: 1.4;">${escapeHtml(task.description)}</div>
                    </div>
                    ` : ''}

                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Плановый срок</div>
                        <div style="color: var(--fg); font-size: 15px;">${deadlineDisplay}</div>
                    </div>

                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Приоритет</div>
                        <div style="color: var(--fg); font-size: 15px;">${task.priority === 'high' ? 'Высокий' : task.priority === 'low' ? 'Низкий' : 'Средний'}</div>
                    </div>

                    <!-- ФОТОГРАФИИ -->
                    <div>
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 8px;">Фотографии (${photos ? photos.length : 0})</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 10px;">
                            ${photos && photos.length > 0 ? photos.map(p => `
                                <div style="position: relative; flex-shrink: 0; width: 100px;">
                                    <img src="${p.photo_url}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                                    <button onclick="window.deleteTaskPhoto(${p.id}, ${task.id})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">×</button>
                                </div>
                            `).join('') : '<div style="color: var(--fg-dim); font-size: 12px;">Нет фото</div>'}
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <input type="file" id="task-photo-upload" accept="image/*" style="display: none;" onchange="window.uploadTaskPhoto(${task.id}, this)">
                            <button type="button" onclick="document.getElementById('task-photo-upload').click()" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                Добавить
                            </button>
                            <button type="button" onclick="window.openCameraModal()" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                Сфотографировать
                            </button>
                        </div>
                    </div>

                    <!-- ДНЕВНИК РАБОТ -->
                    <div style="margin-top: 10px; border-top: 1px solid var(--bg3); padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: var(--fg); margin: 0; font-size: 18px;">Дневник работ</h3>
                            <button onclick="window.addTaskLog(${task.id})" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                🎤 Записать
                            </button>
                        </div>
                        <div id="task-logs-container-${task.id}">
                            ${logs && logs.length > 0 ? logs.map(function(log) { 
                                return '<div style="background: var(--bg2); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--accent);">' +
                                    '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">' +
                                        '<span style="font-size: 12px; color: var(--fg-dim);">' + new Date(log.created_at).toLocaleString('ru-RU') + '</span>' +
                                        '<span style="font-size: 12px; color: var(--accent); font-weight: bold;">' + (log.hours ? log.hours + ' ч.' : '') + ' ' + (log.qty ? log.qty + ' ' + (log.unit || '') : '') + '</span>' +
                                    '</div>' +
                                    '<div style="color: var(--fg); font-size: 14px; white-space: pre-wrap;">' + (log.description || 'Без описания') + '</div>' +
                                '</div>';
                            }).join('') : '<div style="color: var(--fg-dim); font-size: 14px;">Записей пока нет.</div>'}
                        </div>
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

// === МЕНЮ ДЕЙСТВИЙ (ТРИ ТОЧКИ) ===
window.openTaskActions = function(id, name) {
    const oldMenu = document.getElementById('task-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'task-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';

    menu.innerHTML = `
        <div onclick="window.openEditTask(${id})" style="padding: 14px 16px; color: var(--fg); font-size: 15px; cursor: pointer; border-bottom: 1px solid var(--bg3);">Редактировать</div>
        <div onclick="window.deleteTask(${id})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="openTaskActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};


window.openEditTask = async function(id) { localStorage.setItem('currentTaskId', id);
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: task, error } = await db.from('tasks').select('*').eq('id', id).single();
        if (error) throw error;

        const { data: photos, error: photosError } = await db.from('task_photos').select('*').eq('task_id', id).order('created_at', { ascending: false });
        if (photosError) throw photosError;

        const { data: logs, error: logsError } = await db.from('task_progress').select('*').eq('task_id', id).order('created_at', { ascending: false });
        if (logsError) throw logsError;

        const hasDeadlineEnd = task.deadline_end !== null;

        let html = `
            <div style="padding: 10px 20px 20px 20px; max-width: 600px; margin: 0 auto; padding-bottom: 120px;">
                <button onclick="window.openTaskDetail(${task.id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <!-- ОСНОВНАЯ ИНФОРМАЦИЯ -->
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Название</label>
                        <input type="text" id="edit-task-title" value="${escapeHtml(task.title || '')}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 16px;">
                    </div>

                    ${task.description ? `
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                        <textarea id="edit-task-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;">${escapeHtml(task.description)}</textarea>
                    </div>
                    ` : ''}

                    <!-- ИНФОРМАЦИЯ ПО ОБЪЕКТУ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Объект</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Адрес, парковка, как пройти — будут подтягиваться из объекта.</div>
                    </div>

                    <!-- ИСПОЛНИТЕЛИ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Исполнители</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Кто отвечает за задачу — будет здесь.</div>
                    </div>

                    <!-- ДАТЫ РЕАЛЬНОГО ИСПОЛНЕНИЯ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Реальное исполнение</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Фактические даты начала и окончания работ.</div>
                    </div>

                    <!-- СРОК -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <label style="color: var(--fg-dim);">Плановый срок</label>
                            <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 2px;">
                                <button onclick="window.toggleDeadlineType('single')" id="btn-single" style="padding: 4px 10px; border-radius: 10px; border: none; background: ${!hasDeadlineEnd ? 'var(--accent)' : 'transparent'}; color: ${!hasDeadlineEnd ? 'white' : 'var(--fg-dim)'}; font-size: 12px; cursor: pointer;">Одна дата</button>
                                <button onclick="window.toggleDeadlineType('range')" id="btn-range" style="padding: 4px 10px; border-radius: 10px; border: none; background: ${hasDeadlineEnd ? 'var(--accent)' : 'transparent'}; color: ${hasDeadlineEnd ? 'white' : 'var(--fg-dim)'}; font-size: 12px; cursor: pointer;">Диапазон</button>
                            </div>
                        </div>

                        <div id="deadline-single" style="display: ${!hasDeadlineEnd ? 'block' : 'none'};">
                            <input type="date" id="edit-task-deadline-start" value="${task.deadline_start || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        </div>

                        <div id="deadline-range" style="display: ${hasDeadlineEnd ? 'block' : 'none'};">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="date" id="edit-task-deadline-start-range" value="${task.deadline_start || ''}" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                                <span style="color: var(--fg-dim); margin: 0 2px;">—</span>
                                <input type="date" id="edit-task-deadline-end" value="${task.deadline_end || ''}" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; justify-content: center;">
                            <button onclick="window.setQuickDate('today')" style="padding: 6px 12px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Сегодня</button>
                            <button onclick="window.setQuickDate('tomorrow')" style="padding: 6px 12px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">Завтра</button>
                            <button onclick="window.setQuickDate('plus3')" style="padding: 6px 12px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+3 дня</button>
                            <button onclick="window.setQuickDate('plus7')" style="padding: 6px 12px; border-radius: 16px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; cursor: pointer;">+7 дней</button>
                        </div>
                    </div>

                    <!-- СТАТУС И ПРИОРИТЕТ -->
                    <div style="display: flex; gap: 15px;">
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Приоритет</label>
                            <select id="edit-task-priority" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Низкий</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Средний</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Высокий</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Статус</label>
                            <select id="edit-task-status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg);">
                                <option value="active" ${task.status === 'active' ? 'selected' : ''}>В работе</option>
                                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Выполнена</option>
                            </select>
                        </div>
                    </div>

                    <!-- ФОТОГРАФИИ -->
                    <div>
                        <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Фотографии (${photos ? photos.length : 0})</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 10px;">
                            ${photos && photos.length > 0 ? photos.map(p => `
                                <div style="position: relative; flex-shrink: 0; width: 120px;">
                                    <img src="${p.photo_url}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
                                    <div style="font-size: 10px; color: var(--fg-dim); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title || 'Без названия'}</div>
                                    <div style="font-size: 9px; color: var(--fg-dim);">${new Date(p.created_at).toLocaleDateString('ru-RU')}</div>
                                    <button onclick="window.deleteTaskPhoto(${p.id}, ${task.id})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                                </div>
                            `).join('') : '<div style="color: var(--fg-dim); font-size: 12px;">Нет фото</div>'}
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <input type="file" id="task-photo-upload" accept="image/*" style="display: none;" onchange="window.uploadTaskPhoto(${task.id}, this)">
                            <button type="button" onclick="document.getElementById('task-photo-upload').click()" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                Добавить
                            </button>
                            <button type="button" onclick="window.openCameraModal()" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                Сфотографировать
                            </button>
                        </div>
                    </div>

                    <!-- БЛОКНОТ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Блокнот</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Текстовые заметки — будут здесь.</div>
                    </div>

                    <!-- ДОКУМЕНТЫ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Документы</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">PDF, чертежи, сметы — будут здесь.</div>
                    </div>

                    <!-- ЗАПИСИ ДИКТОФОНА (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Записи диктофона</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Аудиозаметки — будут здесь.</div>
                    </div>

                    <!-- СВЯЗИ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Связи</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Связанные задачи и блокировки — будут здесь.</div>
                    </div>

                    <!-- ОТЧЕТЫ (ЗАГЛУШКА) -->
                    <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: var(--fg);">Отчеты</span>
                            <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                        </div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Генерация PDF/Excel — будет здесь.</div>
                    </div>

                    <!-- ДНЕВНИК РАБОТ -->
                    <div style="margin-top: 10px; border-top: 1px solid var(--bg3); padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: var(--fg); margin: 0; font-size: 18px;">Дневник работ</h3>
                            <button onclick="window.addTaskLog(${task.id})" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                🎤 Записать
                            </button>
                        </div>
                        <div id="task-logs-container-${task.id}">
                            ${logs && logs.length > 0 ? logs.map(function(log) { 
                                return '<div style="background: var(--bg2); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--accent);">' +
                                    '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">' +
                                        '<span style="font-size: 12px; color: var(--fg-dim);">' + new Date(log.created_at).toLocaleString('ru-RU') + '</span>' +
                                        '<span style="font-size: 12px; color: var(--accent); font-weight: bold;">' + (log.hours ? log.hours + ' ч.' : '') + ' ' + (log.qty ? log.qty + ' ' + (log.unit || '') : '') + '</span>' +
                                    '</div>' +
                                    '<div style="color: var(--fg); font-size: 14px; white-space: pre-wrap;">' + (log.description || 'Без описания') + '</div>' +
                                '</div>';
                            }).join('') : '<div style="color: var(--fg-dim); font-size: 14px;">Записей пока нет.</div>'}
                        </div>
                    </div>

                    <!-- КНОПКИ ДЕЙСТВИЙ -->
                    <div style="margin-top: 10px;">
                        <button onclick="window.saveTaskChanges(${task.id})" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">
                            Сохранить
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

window.toggleDeadlineType = function(type) {
    if (type === 'single') {
        document.getElementById('deadline-single').style.display = 'block';
        document.getElementById('deadline-range').style.display = 'none';
        document.getElementById('btn-single').style.background = 'var(--accent)';
        document.getElementById('btn-single').style.color = 'white';
        document.getElementById('btn-range').style.background = 'transparent';
        document.getElementById('btn-range').style.color = 'var(--fg-dim)';
    } else {
        document.getElementById('deadline-single').style.display = 'none';
        document.getElementById('deadline-range').style.display = 'block';
        document.getElementById('btn-range').style.background = 'var(--accent)';
        document.getElementById('btn-range').style.color = 'white';
        document.getElementById('btn-single').style.background = 'transparent';
        document.getElementById('btn-single').style.color = 'var(--fg-dim)';
    }
};

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

window.saveTaskChanges = async function(id) {
    const title = document.getElementById('edit-task-title').value.trim();
    const desc = document.getElementById('edit-task-desc').value.trim();
    const priority = document.getElementById('edit-task-priority').value;
    const status = document.getElementById('edit-task-status').value;

    let deadlineStart = null;
    let deadlineEnd = null;

    const isSingle = document.getElementById('deadline-single').style.display !== 'none';
    if (isSingle) {
        deadlineStart = document.getElementById('edit-task-deadline-start').value || null;
    } else {
        deadlineStart = document.getElementById('edit-task-deadline-start-range').value || null;
        deadlineEnd = document.getElementById('edit-task-deadline-end').value || null;
    }

    if (!title) return alert('Название не может быть пустым!');

    try {
        const { error } = await db.from('tasks').update({
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: deadlineStart,
            deadline_end: deadlineEnd,
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
