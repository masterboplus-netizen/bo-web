function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

import { db } from '../api/supabase.js';

window.uploadTaskPhoto = async function(taskId, input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    window.openCategoryPicker(async (category) => {
        try {
            const fileName = `task_${taskId}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { error: uploadError } = await db.storage.from('photos').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);

            const { error: dbError } = await db.from('task_photos').insert([{
                task_id: taskId,
                photo_url: urlData.publicUrl,
                title: null,
                category: category
            }]);
            if (dbError) throw dbError;

            window.openTaskDetail(taskId);
        } catch (err) {
            alert('Ошибка загрузки фото: ' + err.message);
        }
    });
};

window.openCategoryPicker = function(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 24px; max-width: 400px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease;';

    let selectedCategory = 'none';

    const categories = [
        { id: 'works', label: 'Работы' },
        { id: 'docs', label: 'Документы' },
        { id: 'questions', label: 'Вопросы' },
        { id: 'drawings', label: 'Чертежи' },
        { id: 'hidden', label: 'Скрытые работы' },
        { id: 'none', label: 'Без категории' }
    ];

    let buttonsHtml = '';
    categories.forEach(cat => {
        buttonsHtml += '<button onclick="window._selectCategory(\'' + cat.id + '\')" id="cat-btn-' + cat.id + '" style="padding: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: ' + (cat.id === 'none' ? 'var(--accent)' : 'var(--bg2)') + '; color: ' + (cat.id === 'none' ? 'white' : 'var(--fg)') + '; font-size: 14px; cursor: pointer; margin-bottom: 8px; width: 100%; text-align: left;">' + cat.label + '</button>';
    });

    modal.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
        '<h3 style="margin: 0; color: var(--fg); font-size: 18px;">В какую категорию добавить?</h3>' +
        '<button id="close-cat-picker" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>' +
        '</div>' +
        '<div id="cat-buttons-container">' + buttonsHtml + '</div>' +
        '<div style="display: flex; gap: 10px; margin-top: 15px;">' +
        '<button onclick="window._cancelCategoryPicker()" style="flex: 1; padding: 12px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 15px; cursor: pointer;">Отмена</button>' +
        '<button onclick="window._confirmCategory()" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer;">Сохранить</button>' +
        '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    window._selectCategory = function(catId) {
        selectedCategory = catId;
        categories.forEach(cat => {
            const btn = document.getElementById('cat-btn-' + cat.id);
            if (btn) {
                if (cat.id === catId) {
                    btn.style.background = 'var(--accent)';
                    btn.style.color = 'white';
                } else {
                    btn.style.background = 'var(--bg2)';
                    btn.style.color = 'var(--fg)';
                }
            }
        });
    };

    window._cancelCategoryPicker = function() {
        overlay.remove();
    };

    window._confirmCategory = function() {
        overlay.remove();
        callback(selectedCategory);
    };

    document.getElementById('close-cat-picker').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
};

window.openTaskPhotoGallery = function(taskId, category) {
    alert('Показать все фото из категории: ' + category);
};

window.deleteTaskPhoto = async function(photoId, taskId) {
    window.showConfirm('Удалить это фото?', async () => {
        try {
            const { error } = await db.from('task_photos').delete().eq('id', photoId);
            if (error) throw error;
            window.openTaskDetail(taskId);
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

// === ПОЛНОЭКРАННАЯ ГАЛЕРЕЯ ФОТО ===
window._galleryState = {
    taskId: null,
    category: null,
    photos: [],
    currentIndex: 0
};

window.openPhotoGallery = async function(taskId, category, photoId) {
    try {
        // Загружаем все фото задачи
        const { data: allPhotos, error } = await db.from('task_photos').select('*').eq('task_id', taskId);
        if (error) throw error;

        // Фильтруем по категории
        const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === category);
        
        if (catPhotos.length === 0) {
            alert('В этой категории нет фото');
            return;
        }

        // Находим индекс текущего фото
        let startIndex = catPhotos.findIndex(p => p.id === photoId);
        if (startIndex === -1) startIndex = 0;

        window._galleryState = {
            taskId: taskId,
            category: category,
            photos: catPhotos,
            currentIndex: startIndex
        };

        renderGallery();
    } catch (err) {
        alert('Ошибка загрузки галереи: ' + err.message);
    }
};

function renderGallery() {
    const state = window._galleryState;
    const container = document.getElementById('app-content');
    const currentPhoto = state.photos[state.currentIndex];

    const categories = [
        { id: 'works', label: 'Работы' },
        { id: 'docs', label: 'Документы' },
        { id: 'questions', label: 'Вопросы' },
        { id: 'drawings', label: 'Чертежи' },
        { id: 'hidden', label: 'Скрытые работы' },
        { id: 'none', label: 'Без категории' }
    ];

    // Капсула категорий
    let capsuleHtml = '';
    categories.forEach(cat => {
        const isActive = cat.id === state.category;
        capsuleHtml += `<div onclick="window.gallerySwitchCategory('${cat.id}')" style="flex-shrink: 0; padding: 8px 16px; border-radius: 20px; background: ${isActive ? 'var(--accent)' : 'var(--bg2)'}; color: ${isActive ? 'white' : 'var(--fg)'}; font-size: 13px; cursor: pointer; border: 1px solid ${isActive ? 'var(--accent)' : 'var(--bg3)'}; margin-right: 8px; white-space: nowrap;">${cat.label}</div>`;
    });

    container.innerHTML = `
        <div style="padding: 0 20px 20px 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="window.openTaskDetail(${state.taskId})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <button onclick="window.galleryPhotoActions(${currentPhoto.id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
            </div>

            <div style="color: var(--fg); font-size: 14px; margin-bottom: 10px;">${escapeHtml(currentPhoto.title || 'Фото')}</div>

            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none;">
                ${capsuleHtml}
            </div>

            <div style="position: relative; width: 100%; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 15px;">
                <img src="${currentPhoto.photo_url}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain; display: block;">
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button onclick="window.galleryPrev()" style="flex: 1; margin-right: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; font-size: 16px; cursor: pointer; ${state.currentIndex === 0 ? 'opacity: 0.5;' : ''}" ${state.currentIndex === 0 ? 'disabled' : ''}>← Назад</button>
                <div style="color: var(--fg-dim); font-size: 14px; margin: 0 15px;">${state.currentIndex + 1} / ${state.photos.length}</div>
                <button onclick="window.galleryNext()" style="flex: 1; margin-left: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; font-size: 16px; cursor: pointer; ${state.currentIndex === state.photos.length - 1 ? 'opacity: 0.5;' : ''}" ${state.currentIndex === state.photos.length - 1 ? 'disabled' : ''}>Вперед →</button>
            </div>
        </div>
    `;
}

window.galleryPrev = function() {
    if (window._galleryState.currentIndex > 0) {
        window._galleryState.currentIndex--;
        renderGallery();
    }
};

window.galleryNext = function() {
    if (window._galleryState.currentIndex < window._galleryState.photos.length - 1) {
        window._galleryState.currentIndex++;
        renderGallery();
    }
};

window.gallerySwitchCategory = async function(catId) {
    const state = window._galleryState;
    try {
        const { data: allPhotos, error } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
        if (error) throw error;

        const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === catId);
        
        if (catPhotos.length === 0) {
            alert('В этой категории нет фото');
            return;
        }

        window._galleryState = {
            taskId: state.taskId,
            category: catId,
            photos: catPhotos,
            currentIndex: 0
        };

        renderGallery();
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

window.galleryPhotoActions = function(photoId) {
    const oldMenu = document.getElementById('photo-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'photo-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';

    menu.innerHTML = `
        <div onclick="this.parentElement.remove(); window.galleryDeletePhoto(${photoId})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="galleryPhotoActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};

window.galleryDeletePhoto = function(photoId) {
    window.showConfirm('Удалить это фото?', async () => {
        try {
            const state = window._galleryState;
            const { error } = await db.from('task_photos').delete().eq('id', photoId);
            if (error) throw error;

            // Перезагружаем галерею
            if (state.photos.length <= 1) {
                window.openTaskDetail(state.taskId);
            } else {
                const { data: allPhotos } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
                const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === state.category);
                if (catPhotos.length === 0) {
                    window.openTaskDetail(state.taskId);
                } else {
                    window._galleryState.photos = catPhotos;
                    window._galleryState.currentIndex = Math.min(state.currentIndex, catPhotos.length - 1);
                    renderGallery();
                }
            }
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};
