import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderTasks() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        // Запрашиваем задачи из Supabase
        const { data: tasks, error } = await db
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
            return;
        }

        let html = '<div style="padding: 10px;">';
        
        tasks.forEach(task => {
            let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
            let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';
            
            html += `
                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-weight: bold; font-size: 16px; color: var(--fg);">${escapeHtml(task.title || 'Без названия')}</div>
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${statusText}</span>
                    </div>
                    ${task.description ? `<div style="font-size: 14px; color: var(--fg-dim);">${escapeHtml(task.description)}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--fg-dim); margin-top: 5px;">
                        <span>ID: ${task.id}</span>
                        <span>${new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
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

            <!-- Срок -->
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label style="color: var(--fg-dim);">Срок</label>
                    <div style="display: flex; gap: 5px;">
                        <button type="button" id="btn-single-date" onclick="window.setDateMode('single')" style="padding: 4px 10px; border-radius: 12px; border: 1px solid var(--accent); background: var(--accent); color: white; font-size: 12px; cursor: pointer;">Одна дата</button>
                        <button type="button" id="btn-range-date" onclick="window.setDateMode('range')" style="padding: 4px 10px; border-radius: 12px; border: 1px solid var(--bg3); background: transparent; color: var(--fg-dim); font-size: 12px; cursor: pointer;">Диапазон</button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="date" id="new-task-deadline-start" value="${today}" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                    <input type="date" id="new-task-deadline-end" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; display: none;">
                    
                    <select id="new-task-quick-date" onchange="window.applyQuickDate(this.value)" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 12px; max-width: 100px;">
                        <option value="">Быстро...</option>
                        <option value="today">Сегодня</option>
                        <option value="tomorrow">Завтра</option>
                        <option value="plus3">+3 дня</option>
                    </select>
                </div>
            </div>

            <!-- Фото -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Фото</label>
                <input type="file" id="new-task-photo" accept="image/*" capture="environment" style="display: none;" onchange="window.handlePhotoAttach(this)">
                <button type="button" onclick="document.getElementById('new-task-photo').click()" style="padding: 10px 15px; border-radius: 8px; border: 1px dashed var(--fg-dim); background: transparent; color: var(--fg); cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    📷 Прикрепить фото
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

// Вспомогательные функции для формы
window.setDateMode = function(mode) {
    const startInput = document.getElementById('new-task-deadline-start');
    const endInput = document.getElementById('new-task-deadline-end');
    const btnSingle = document.getElementById('btn-single-date');
    const btnRange = document.getElementById('btn-range-date');

    if (mode === 'range') {
        endInput.style.display = 'block';
        btnRange.style.background = 'var(--accent)';
        btnRange.style.color = 'white';
        btnRange.style.borderColor = 'var(--accent)';
        btnSingle.style.background = 'transparent';
        btnSingle.style.color = 'var(--fg-dim)';
        btnSingle.style.borderColor = 'var(--bg3)';
    } else {
        endInput.style.display = 'none';
        endInput.value = '';
        btnSingle.style.background = 'var(--accent)';
        btnSingle.style.color = 'white';
        btnSingle.style.borderColor = 'var(--accent)';
        btnRange.style.background = 'transparent';
        btnRange.style.color = 'var(--fg-dim)';
        btnRange.style.borderColor = 'var(--bg3)';
    }
};

window.applyQuickDate = function(val) {
    if (!val) return;
    const d = new Date();
    if (val === 'today') { /* keep today */ }
    else if (val === 'tomorrow') { d.setDate(d.getDate() + 1); }
    else if (val === 'plus3') { d.setDate(d.getDate() + 3); }
    
    document.getElementById('new-task-deadline-start').value = d.toISOString().split('T')[0];
    document.getElementById('new-task-quick-date').value = ''; // reset
};

window.handlePhotoAttach = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-preview').style.display = 'block';
            document.getElementById('photo-img').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
};

export async function saveNewTask() {
    const title = document.getElementById('new-task-title').value.trim();
    const desc = document.getElementById('new-task-desc').value.trim();
    const priority = document.getElementById('new-task-priority').value;
    const dateStart = document.getElementById('new-task-deadline-start').value;
    const dateEnd = document.getElementById('new-task-deadline-end').value;
    const photoInput = document.getElementById('new-task-photo');

    if (!title) {
        alert('Название задачи обязательно!');
        return;
    }

    let photoUrl = null;

    // 1. Если выбрано фото - загружаем в Supabase Storage
    if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `task_${Date.now()}.${fileExt}`;

        try {
            const { data, error } = await db.storage
                .from('photos')
                .upload(fileName, file);

            if (error) throw error;

            // Получаем публичную ссылку
            const { data: urlData } = db.storage
                .from('photos')
                .getPublicUrl(fileName);
            
            photoUrl = urlData.publicUrl;
        } catch (err) {
            console.error('Ошибка загрузки фото:', err);
            alert('Не удалось загрузить фото: ' + err.message);
            // Не прерываем создание задачи, просто идем дальше без фото
        }
    }

    // 2. Сохраняем задачу
    try {
        const { error } = await db.from('tasks').insert([{
            title: title,
            description: desc || null,
            priority: priority,
            deadline_start: dateStart || null,
            deadline_end: dateEnd || null,
            status: 'active',
            photo_url: photoUrl // Сохраняем ссылку в поле photo_url (если оно есть)
        }]);

        if (error) throw error;
        
        window.openTasks();
    } catch (err) {
        console.error(err);
        alert('Ошибка при сохранении: ' + err.message);
    }
}
