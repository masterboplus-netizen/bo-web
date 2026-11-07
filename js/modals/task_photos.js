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
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 16px; width: calc(100vw - 40px); max-width: 400px; max-height: 85vh; overflow-y: auto; box-sizing: border-box; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease;';

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
        buttonsHtml += '<button onclick="window._selectCategory(\'' + cat.id + '\')" id="cat-btn-' + cat.id + '" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: ' + (cat.id === 'none' ? 'var(--accent)' : 'var(--bg2)') + '; color: ' + (cat.id === 'none' ? 'white' : 'var(--fg)') + '; font-size: 14px; cursor: pointer; margin-bottom: 8px; width: 100%; text-align: left;">' + cat.label + '</button>';
    });

    modal.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
        '<h3 style="margin: 0; color: var(--fg); font-size: 16px;">В какую категорию добавить?</h3>' +
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

        // Всегда открываем с первого фото
        window._galleryState = {
            taskId: taskId,
            category: category,
            photos: catPhotos,
            currentIndex: 0
        };

        const container = document.getElementById('app-content');
        if (container) container.scrollTop = 0;
            const replaceBtn = document.createElement("button"); 
            replaceBtn.innerHTML = "🔄 Заменить фото"; 
            replaceBtn.style.cssText = "width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; font-size: 14px; margin-bottom: 15px;"; 
            replaceBtn.onclick = function() { window.galleryReplacePhoto(currentPhoto.id); }; 
            const mainDiv = container.querySelector("div"); 
            if (mainDiv) mainDiv.appendChild(replaceBtn);
        
        renderGallery();
    } catch (err) {
        alert('Ошибка загрузки галереи: ' + err.message);
    }
};

function renderGallery() {
    const state = window._galleryState;
    const container = document.getElementById('app-content');
    const currentPhoto = state.photos[state.currentIndex];
    
    // Если в категории нет фото — показываем заглушку
    if (!currentPhoto) {
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
                </div>
                
                <div style="display: flex; align-items: center; background: var(--bg2); border-radius: 20px; border: 1px solid var(--bg3); overflow: hidden; margin-bottom: 15px;">
                    <div onclick="window.gallerySwitchCategory('${prevCat.id}')" style="flex: 1; padding: 12px; text-align: center; color: var(--fg-dim); font-size: 13px; cursor: pointer;">${prevCat.label}</div>
                    <div style="flex: 1; padding: 12px; text-align: center; color: white; background: var(--accent); font-size: 13px; font-weight: bold;">${currentCat.label}</div>
                    <div onclick="window.gallerySwitchCategory('${nextCat.id}')" style="flex: 1; padding: 12px; text-align: center; color: var(--fg-dim); font-size: 13px; cursor: pointer;">${nextCat.label}</div>
                </div>
                
                <div style="text-align: center; padding: 60px 20px; color: var(--fg-dim); font-size: 16px; background: var(--bg2); border-radius: 12px; border: 1px dashed var(--bg3); margin-bottom: 15px;">
                    Нет фото
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <input type="file" id="task-photo-upload" accept="image/*" style="display: none;" onchange="window.uploadTaskPhoto(${state.taskId}, this)">
                    <button type="button" onclick="document.getElementById('task-photo-upload').click()" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        Добавить
                    </button>
                    <button type="button" onclick="window.openCameraModal()" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        Сфотографировать
                    </button>
                </div>
            </div>
        `;
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

    // Закольцованная капсула категорий (3 раздела: левый, активный, правый)
    let capsuleHtml = '';
    const catIds = categories.map(c => c.id);
    const currentIdx = catIds.indexOf(state.category);
    const prevIdx = (currentIdx - 1 + categories.length) % categories.length;
    const nextIdx = (currentIdx + 1) % categories.length;

    const prevCat = categories[prevIdx];
    const currentCat = categories[currentIdx];
    const nextCat = categories[nextIdx];

    capsuleHtml = `
        <div style="display: flex; align-items: stretch; background: var(--bg2); border-radius: 20px; border: 1px solid var(--bg3); overflow: hidden; margin-bottom: 15px; height: 50px;">
            <div onclick="window.gallerySwitchCategory('${prevCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">
                ${prevCat.label}
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: white; background: var(--accent); font-size: 12px; font-weight: bold; line-height: 1.2; overflow: hidden;">
                ${currentCat.label}
            </div>
            <div onclick="window.gallerySwitchCategory('${nextCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">
                ${nextCat.label}
            </div>
        </div>
    `;

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

            <div onclick="window.openEditPhotoTitle(${currentPhoto.id}, '${escapeHtml(currentPhoto.title || '')}')" style="background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 12px 15px; margin-bottom: 10px; cursor: pointer;">
                <div style="color: var(--fg-dim); font-size: 11px; margin-bottom: 3px;">Название</div>
                <div style="color: var(--fg); font-size: 15px; font-weight: 500;">${escapeHtml(currentPhoto.title || 'Без названия')}</div>
            </div>

            <div onclick="window.galleryMovePhoto(${currentPhoto.id})" style="background: var(--bg2); border: 1px solid var(--bg3); border-radius: 12px; padding: 12px 15px; margin-bottom: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: var(--fg-dim); font-size: 11px; margin-bottom: 3px;">Раздел</div>
                    <div style="color: var(--fg); font-size: 15px; font-weight: 500;">${currentCat.label}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--fg-dim)" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>

            <div style="position: relative; width: 100%; height: 60vh; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <img src="${currentPhoto.photo_url}" style="width: 100%; height: 100%; object-fit: contain; display: block;">
            </div>

            <!-- Лента миниатюр -->
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

            ${capsuleHtml}
        </div>
    `;
    container.scrollTop = 0;
            const replaceBtn = document.createElement("button"); 
            replaceBtn.innerHTML = "🔄 Заменить фото"; 
            replaceBtn.style.cssText = "width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); cursor: pointer; font-size: 14px; margin-bottom: 15px;"; 
            replaceBtn.onclick = function() { window.galleryReplacePhoto(currentPhoto.id); }; 
            const mainDiv = container.querySelector("div"); 
            if (mainDiv) mainDiv.appendChild(replaceBtn);
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

window.gallerySwitchCategory = async function(catId) {
    const state = window._galleryState;
    try {
        const { data: allPhotos, error } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
        if (error) throw error;

        const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === catId);
        
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
            setTimeout(() => window.openTaskDetail(state.taskId), 500);
                }
            }
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};


window.galleryJumpTo = function(index) {
    if (index >= 0 && index < window._galleryState.photos.length) {
        window._galleryState.currentIndex = index;
        renderGallery();
    }
};


window.galleryMovePhoto = function(photoId) {
    window.openCategoryPicker(async (newCategory) => {
        try {
            const { error } = await db.from('task_photos').update({ category: newCategory }).eq('id', photoId);
            if (error) throw error;

            const state = window._galleryState;
            const { data: allPhotos } = await db.from('task_photos').select('*').eq('task_id', state.taskId);
            const catPhotos = (allPhotos || []).filter(p => (p.category || 'none') === newCategory);

            if (catPhotos.length === 0) {
                window.openTaskDetail(state.taskId);
            } else {
                window._galleryState = {
                    taskId: state.taskId,
                    category: newCategory,
                    photos: catPhotos,
                    currentIndex: 0
                };
                renderGallery();
            setTimeout(() => window.openTaskDetail(state.taskId), 500);
            }
        } catch (err) {
            alert('Ошибка перемещения: ' + err.message);
        }
    });
};

// === ЗАМЕНА ФОТО ===
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
            const { error: dbError } = await db.from('task_photos').update({ photo_url: urlData.publicUrl }).eq('id', photoId);
            if (dbError) throw dbError;
            const updatedPhotos = state.photos.map(p => p.id === photoId ? { ...p, photo_url: urlData.publicUrl } : p);
            window._galleryState.photos = updatedPhotos;
            renderGallery();
            setTimeout(() => window.openTaskDetail(state.taskId), 500);
        } catch (err) {
            alert('Ошибка замены: ' + err.message);
        }
    };
    input.click();
};
