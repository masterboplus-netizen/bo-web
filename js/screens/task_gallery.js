import { db } from '../api/supabase.js';


window.safePhotoId = function(id, source) {
    if (id === null || id === undefined || id === 'null' || id === 'undefined' || isNaN(Number(id))) {
        alert('❌ NULL PHOTO ID from: ' + source + ' | value: ' + id);
        console.trace('Trace for null photoId');
        return null;
    }
    return Number(id);
};

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

window._galleryState = {
    taskId: null,
    category: null,
    photos: [],
    currentIndex: 0
};

export async function openPhotoGallery(taskId, category, photoId) {
    try {
        const { data: allPhotos, error } = await db.from('task_photos').select('*').eq('task_id', taskId);
        if (error) throw error;

        const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === category);
        if (catPhotos.length === 0) {
            alert('В этой категории нет фото');
            return;
        }

        window._galleryState = {
            taskId: taskId,
            category: category,
            photos: catPhotos,
            currentIndex: 0
        };

        const container = document.getElementById('app-content');
        if (container) container.scrollTop = 0;
        renderGallery();
    } catch (err) {
        alert('Ошибка загрузки галереи: ' + err.message);
    }
}

export function renderGallery() {
    const state = window._galleryState;
    const container = document.getElementById('app-content');
    const currentPhoto = state.photos[state.currentIndex];

    if (!currentPhoto) {
        container.innerHTML = `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Нет фото</div>`;
        return;
    }

    const categories = [
        { id: 'works', label: 'Работы' },
        { id: 'docs', label: 'Документы' },
        { id: 'questions', label: 'Вопросы' },
        { id: 'drawings', label: 'Чертежи' },
        { id: 'hidden', label: 'Скрытые работы' },
        { id: 'none', label: 'Без категории' }
    ];

    const catIds = categories.map(c => c.id);
    const currentIdx = catIds.indexOf(state.category);
    const prevIdx = (currentIdx - 1 + categories.length) % categories.length;
    const nextIdx = (currentIdx + 1) % categories.length;
    const prevCat = categories[prevIdx];
    const currentCat = categories[currentIdx];
    const nextCat = categories[nextIdx];

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

            <div onclick="window.openEditPhotoTitle(${currentPhoto.id}, '${escapeHtml(currentPhoto.title || '')}')" style="background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 12px 15px; margin-bottom: 15px; cursor: pointer;">
                <div style="color: var(--fg-dim); font-size: 11px; margin-bottom: 3px;">Название</div>
                <div style="color: var(--fg); font-size: 15px; font-weight: 500;">${escapeHtml(currentPhoto.title || 'Без названия')}</div>
            </div>

            <div style="position: relative; width: 100%; height: 60vh; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <img src="${currentPhoto.photo_url}" style="width: 100%; height: 100%; object-fit: contain; display: block;">
            </div>

            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none;">
                ${state.photos.map((p, idx) => `
                    <div onclick="window.galleryJumpTo(${idx})" style="flex-shrink: 0; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid ${idx === state.currentIndex ? 'var(--accent)' : 'transparent'}; opacity: ${idx === state.currentIndex ? '1' : '0.6'}; transition: all 0.2s;">
                        <img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                `).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="window.galleryPrev()" style="flex: 1; margin-right: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div style="color: var(--fg-dim); font-size: 14px; margin: 0 15px;">${state.currentIndex + 1} / ${state.photos.length}</div>
                <button onclick="window.galleryNext()" style="flex: 1; margin-left: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>

            <div style="display: flex; align-items: stretch; background: var(--bg2); border-radius: 20px; border: 1px solid var(--bg3); overflow: hidden; margin-bottom: 15px; height: 50px;">
                <div onclick="window.gallerySwitchCategory('${prevCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">${prevCat.label}</div>
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: white; background: var(--accent); font-size: 12px; font-weight: bold; line-height: 1.2; overflow: hidden;">${currentCat.label}</div>
                <div onclick="window.gallerySwitchCategory('${nextCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">${nextCat.label}</div>
            </div>
        </div>
    `;
    container.scrollTop = 0;
}

window.galleryPrev = function() {
    const state = window._galleryState;
    state.currentIndex = (state.currentIndex - 1 + state.photos.length) % state.photos.length;
    renderGallery();
};

window.galleryNext = function() {
    const state = window._galleryState;
    state.currentIndex = (state.currentIndex + 1) % state.photos.length;
    renderGallery();
};

window.galleryJumpTo = function(index) {
    if (index >= 0 && index < window._galleryState.photos.length) {
        window._galleryState.currentIndex = index;
        renderGallery();
    }
};

window.gallerySwitchCategory = async function(catId) {
    const state = window._galleryState;
    try {
        const { data: allPhotos, error } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
        if (error) throw error;
        const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === catId);
        window._galleryState = { taskId: state.taskId, category: catId, photos: catPhotos, currentIndex: 0 };
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

window.taskGalleryDeletePhoto = function(photoId) {
    const safeId = window.safePhotoId(photoId, 'task_gallery.galleryDeletePhoto');
    const state = window._galleryState;
    if (!state || !state.taskId) { window.openPhotos(); return; }
    if (!safeId) return;
    window.showConfirm('Удалить это фото?', async () => {
        try {
            // state is already defined above
            const { error } = await db.from('task_photos').delete().eq('id', safeId);
            if (error) throw error;
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

window.galleryMovePhoto = function(photoId) {
    window.openCategoryPicker(async (newCategory) => {
        try {
            const { error } = await db.from('task_photos').update({ category: newCategory }).eq('id', safeId);
            if (error) throw error;
            const state = window._galleryState;
            const { data: allPhotos } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
            const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === newCategory);
            if (catPhotos.length === 0) {
                window.openTaskDetail(state.taskId);
            } else {
                window._galleryState = { taskId: state.taskId, category: newCategory, photos: catPhotos, currentIndex: 0 };
                renderGallery();
            }
        } catch (err) {
            alert('Ошибка перемещения: ' + err.message);
        }
    });
};

window.galleryReplacePhoto = function(photoId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const state = window._galleryState;
            const fileName = `task_${state.taskId}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { error: uploadError } = await db.storage.from('photos').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
            const { error: dbError } = await db.from('task_photos').update({ photo_url: urlData.publicUrl }).eq('id', safeId);
            if (dbError) throw dbError;
            const updatedPhotos = state.photos.map(p => p.id === photoId ? { ...p, photo_url: urlData.publicUrl } : p);
            window._galleryState.photos = updatedPhotos;
            renderGallery();
        } catch (err) {
            alert('Ошибка замены: ' + err.message);
        }
    };
    input.click();
};

window.openPhotoGallery = openPhotoGallery;
window.renderGallery = renderGallery;
