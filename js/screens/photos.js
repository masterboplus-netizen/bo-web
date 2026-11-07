import { db } from '../api/supabase.js';
import { fetchAllPhotos, fetchPhotoLinks } from '../api/photos.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

window._galleryFilter = 'all';

export async function renderPhotos() {
    if (window.setNavActive) window.setNavActive('photos');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка галереи...</div>';

    try {
        const photos = await fetchAllPhotos();
        const links = await db.from('photo_links').select('*');
        const linksData = links.data || [];

        // Группируем фото по задачам
        const tasksMap = new Map();
        const withoutTask = [];

        photos.forEach(p => {
            const photoLinks = linksData.filter(l => l.photo_id === p.id);
            const taskLink = photoLinks.find(l => l.link_type === 'task');

            if (taskLink) {
                if (!tasksMap.has(taskLink.link_id)) {
                    tasksMap.set(taskLink.link_id, { photos: [], title: 'Задача ID: ' + taskLink.link_id });
                }
                tasksMap.get(taskLink.link_id).photos.push(p);
            } else {
                withoutTask.push(p);
            }
        });

        // Получаем названия задач
        for (const [taskId, data] of tasksMap) {
            try {
                const { data: task } = await db.from('tasks').select('title').eq('id', taskId).single();
                if (task) data.title = task.title;
            } catch (e) {}
        }

        // Фильтр по категориям
        const filter = window._galleryFilter || 'all';
        const filterCategories = ['works', 'docs', 'questions', 'drawings', 'hidden', 'none'];

        let filteredTasks = Array.from(tasksMap.entries());
        let filteredWithout = withoutTask;

        if (filter !== 'all') {
            filteredTasks = filteredTasks.map(([id, data]) => {
                const filteredPhotos = data.photos.filter(p => (p.category || 'none') === filter);
                return [id, { ...data, photos: filteredPhotos }];
            }).filter(([id, data]) => data.photos.length > 0);

            filteredWithout = withoutTask.filter(p => (p.category || 'none') === filter);
        }

        // Рендер
        let html = '<div style="padding: 10px; max-width: 800px; margin: 0 auto; padding-bottom: 100px;">';
        html += '<h2 style="color: var(--fg); margin-bottom: 15px;">Галерея</h2>';

        // Фильтр (капсула)
        const filters = [
            { id: 'all', label: 'Все' },
            { id: 'works', label: 'Работы' },
            { id: 'docs', label: 'Документы' },
            { id: 'questions', label: 'Вопросы' },
            { id: 'drawings', label: 'Чертежи' },
            { id: 'hidden', label: 'Скрытые' },
            { id: 'none', label: 'Без категории' }
        ];

        html += '<div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none;">';
        filters.forEach(f => {
            const isActive = filter === f.id;
            html += `<div onclick="window.setGalleryFilter('${f.id}')" style="flex-shrink: 0; padding: 8px 14px; border-radius: 16px; border: 1px solid var(--bg3); background: ${isActive ? 'var(--accent)' : 'var(--bg2)'}; color: ${isActive ? 'white' : 'var(--fg)'}; font-size: 13px; cursor: pointer; white-space: nowrap;">${f.label}</div>`;
        });
        html += '</div>';

        // Лента с задачами
        for (const [taskId, data] of filteredTasks) {
            html += `<div style="margin-bottom: 25px;">`;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">`;
            html += `<div style="color: var(--fg); font-size: 16px; font-weight: bold;">${escapeHtml(data.title)}</div>`;
            html += `<div style="color: var(--fg-dim); font-size: 12px;">${data.photos.length} фото</div>`;
            html += `</div>`;
            html += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">`;
            data.photos.forEach(p => {
                html += `<div onclick="window.openPhotoGallery(${taskId}, '${p.category || 'none'}', ${p.id})" style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; background: #000;"><img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;"></div>`;
            });
            html += `</div></div>`;
        }

        // Без задачи
        if (filteredWithout.length > 0) {
            html += `<div style="margin-bottom: 25px;">`;
            html += `<div style="color: var(--fg); font-size: 16px; font-weight: bold; margin-bottom: 10px;">Без задачи</div>`;
            html += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">`;
            filteredWithout.forEach(p => {
                html += `<div onclick="window.openPhotoGallery(null, '${p.category || 'none'}', ${p.id})" style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; background: #000;"><img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;"></div>`;
            });
            html += `</div></div>`;
        }

        if (filteredTasks.length === 0 && filteredWithout.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Фото пока нет.</div>`;
        }

        html += '</div>';
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.setGalleryFilter = function(filter) {
    window._galleryFilter = filter;
    renderPhotos();
};

window.openPhotos = function() {
    if (window.saveCurrentScreen) window.saveCurrentScreen('photos');
    renderPhotos();
};
