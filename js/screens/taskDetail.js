import { db } from '../api/supabase.js';
import { renderPhotoRibbons, renderWorkLog } from './task_detail_parts.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openTaskDetail(id) {
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

        const ribbonsHtml = renderPhotoRibbons(photos, task.id);

        let html = `
            <div style="padding: 0 10px 20px 10px; max-width: 100%; margin: 0 auto; padding-bottom: 120px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button onclick="window.openTasks()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <button onclick="window.openTaskActions(${task.id}, '${escapeHtml(task.title)}')" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                </div>

                <div style="background: var(--bg2); border-radius: 16px; padding: 15px; border: 1px solid var(--bg3); box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box;">
                    <div>
                        <h2 onclick="window.openEditField('title', '${escapeHtml(task.title)}', ${task.id})" style="margin: 0 0 10px 0; color: var(--fg); font-size: 24px; cursor: pointer;">${escapeHtml(task.title)}</h2>
                        <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${statusText}</span>
                    </div>

                    ${task.description ? `
                    <div onclick="window.openEditField('description', '${escapeHtml(task.description || '')}', ${task.id})" style="padding: 15px; border-bottom: 1px solid var(--bg3); cursor: pointer;">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Описание</div>
                        <div style="color: var(--fg); font-size: 15px;">${escapeHtml(task.description)}</div>
                    </div>
                    ` : ''}

                    <div onclick="window.openEditField('deadline', '${(task.deadline_start || '').substring(0, 10)}${task.deadline_end ? ' - ' + task.deadline_end.substring(0, 10) : ''}', ${task.id})" style="padding: 15px; border-bottom: 1px solid var(--bg3); cursor: pointer;">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Плановый срок</div>
                        <div style="color: var(--fg); font-size: 15px;">${deadlineDisplay}</div>
                    </div>

                    <div onclick="window.openEditField('priority', '${task.priority || ''}', ${task.id})" style="padding: 15px; border-bottom: 1px solid var(--bg3); cursor: pointer;">
                        <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Приоритет</div>
                        <div style="color: var(--fg); font-size: 15px;">${task.priority === 'high' ? 'Высокий' : task.priority === 'low' ? 'Низкий' : 'Средний'}</div>
                    </div>

                    <!-- ЗАГЛУШКИ -->
                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Объект</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Адрес, парковка, как пройти — будут здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Исполнители</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Кто отвечает за задачу — будет здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Реальное исполнение</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Фактические даты начала и окончания работ</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <!-- ФОТОГРАФИИ (ЛЕНТЫ) -->
                    <div>
                        <h3 style="color: var(--fg); margin: 0 0 10px 0; font-size: 18px;">Фотолента</h3>
                        ${ribbonsHtml}
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

                    <!-- ЗАГЛУШКИ (продолжение) -->
                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Блокнот</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Текстовые заметки — будут здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Документы</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">PDF, чертежи, сметы — будут здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Записи диктофона</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Аудиозаметки — будут здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Связи</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Связанные задачи и блокировки — будут здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <div style="padding: 15px; border-bottom: 1px solid var(--bg3); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--fg); font-size: 14px;">Отчеты</div>
                            <div style="color: var(--fg-dim); font-size: 13px; margin-top: 3px;">Генерация PDF/Excel — будет здесь</div>
                        </div>
                        <span style="color: var(--fg-dim); font-size: 12px;">Заглушка</span>
                    </div>

                    <!-- ДНЕВНИК РАБОТ -->
                    <div style="margin-top: 10px; border-top: 1px solid var(--bg3); padding-top: 15px;">
                        <h3 style="color: var(--fg); margin: 0 0 15px 0; font-size: 18px;">Дневник работ</h3>
                        <div>
                            ${renderWorkLog(logs)}</div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.openTaskDetail = openTaskDetail;
