import { db } from '../api/supabase.js';
import { fetchPhotosByLink, unlinkPhoto } from '../api/photos.js';

window.safePhotoId = function(id, source) {
    if (id === null || id === undefined || id === 'null' || id === 'undefined' || isNaN(Number(id))) {
        alert('❌ NULL PHOTO ID from: ' + source + ' | value: ' + id);
        return null;
    }
    return Number(id);
};

let galleryState = {
    taskId: null,
    category: null,
    photos: [],
    allPhotos: [],
    currentIndex: 0
};

export async function openPhotoGallery(taskId, category, photoId) {
    try {
        const allTaskPhotos = await fetchPhotosByLink('task', taskId);
        
        if (!allTaskPhotos || allTaskPhotos.length === 0) {
            alert('В этой задаче пока нет фотографий');
            return;
        }

        // Ищем, есть ли фото в запрошенной категории
        let catPhotos = allTaskPhotos.filter(p => (p.category || 'none') === category);
        let activeCategory = category;

        // Если в запрошенной категории пусто, ищем первую доступную
        if (catPhotos.length === 0) {
            const availableCat = allTaskPhotos[0].category || 'none';
            catPhotos = allTaskPhotos.filter(p => (p.category || 'none') === availableCat);
            activeCategory = availableCat;
        }

        galleryState = {
            taskId: taskId,
            category: activeCategory,
            photos: catPhotos,
            allPhotos: allTaskPhotos,
            currentIndex: 0
        };

        renderOverlay();
    } catch (err) {
        alert('Ошибка загрузки галереи: ' + err.message);
    }
}

function renderOverlay() {
    const oldOverlay = document.getElementById('photo-gallery-overlay');
    if (oldOverlay) oldOverlay.remove();

    if (!galleryState.photos || galleryState.photos.length === 0) return;

    const currentPhoto = galleryState.photos[galleryState.currentIndex];
    
    if (!currentPhoto) {
        window.closePhotoGallery();
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

    // Фильтруем категории: оставляем только те, в которых есть фото
    const availableCats = categories.filter(c => 
        galleryState.allPhotos.some(p => (p.category || 'none') === c.id)
    );

    let capsuleHtml = '<div style="display: flex; align-items: stretch; background: rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; height: 50px;">';
    availableCats.forEach(cat => {
        const isActive = cat.id === galleryState.category;
        capsuleHtml += `<div onclick="window.gallerySwitchCategory('${cat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: ${isActive ? 'white' : 'rgba(255,255,255,0.6)'}; background: ${isActive ? 'var(--accent)' : 'transparent'}; font-size: 12px; font-weight: ${isActive ? 'bold' : 'normal'}; cursor: pointer; line-height: 1.2; overflow: hidden;">${cat.label}</div>`;
    });
    capsuleHtml += '</div>';

    const overlay = document.createElement('div');
    overlay.id = 'photo-gallery-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 100000; display: flex; flex-direction: column;';

    overlay.innerHTML = `
        <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
            <button onclick="window.closePhotoGallery()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            <div style="font-size: 16px; font-weight: bold;">${currentPhoto.title || 'Без названия'}</div>
            <button onclick="window.galleryPhotoActions(${currentPhoto.id})" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;">⋮</button>
        </div>

        <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${currentPhoto.photo_url}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>

        <div style="padding: 10px 20px; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;">
            ${galleryState.photos.map((p, idx) => `
                <div onclick="window.galleryJumpTo(${idx})" style="flex-shrink: 0; width: 50px; height: 50px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid ${idx === galleryState.currentIndex ? 'white' : 'transparent'}; opacity: ${idx === galleryState.currentIndex ? '1' : '0.5'}; transition: all 0.2s;">
                    <img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            `).join('')}
        </div>

        <div style="padding: 0 20px 20px 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
            <button onclick="window.galleryPrev()" style="flex: 1; margin-right: 10px; padding: 14px; background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div style="font-size: 14px; margin: 0 15px;">${galleryState.currentIndex + 1} / ${galleryState.photos.length}</div>
            <button onclick="window.galleryNext()" style="flex: 1; margin-left: 10px; padding: 14px; background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        </div>

        <div style="padding: 0 20px 30px 20px;">
            ${capsuleHtml}
        </div>
    `;

    document.body.appendChild(overlay);
}

window.closePhotoGallery = function() {
    const overlay = document.getElementById('photo-gallery-overlay');
    if (overlay) overlay.remove();
};

window.galleryPrev = function() {
    galleryState.currentIndex = (galleryState.currentIndex - 1 + galleryState.photos.length) % galleryState.photos.length;
    renderOverlay();
};

window.galleryNext = function() {
    galleryState.currentIndex = (galleryState.currentIndex + 1) % galleryState.photos.length;
    renderOverlay();
};

window.galleryJumpTo = function(index) {
    if (index >= 0 && index < galleryState.photos.length) {
        galleryState.currentIndex = index;
        renderOverlay();
    }
};

window.gallerySwitchCategory = function(catId) {
    const catPhotos = (galleryState.allPhotos || []).filter(p => (p.category || 'none') === catId);
    
    if (catPhotos.length === 0) {
        alert('В этой категории нет фото');
        return;
    }
    
    galleryState.category = catId;
    galleryState.photos = catPhotos;
    galleryState.currentIndex = 0;
    renderOverlay();
};

window.galleryPhotoActions = function(photoId) {
    const oldMenu = document.getElementById('photo-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'photo-action-menu';
    menu.style.cssText = 'position: fixed; top: 70px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.8); z-index: 100005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';
    
    menu.innerHTML = `
        <div onclick="this.parentElement.remove(); window.taskGalleryUnlinkPhoto(${photoId})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Отвязать от задачи</div>
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

window.taskGalleryUnlinkPhoto = async function(photoId) {
    const safeId = window.safePhotoId(photoId, 'task_gallery.unlink');
    if (!safeId || !galleryState.taskId) return;
    
    window.showConfirm('Отвязать это фото от задачи? (Оно останется в общей галерее)', async () => {
        try {
            await unlinkPhoto(safeId, 'task', galleryState.taskId);
            
            const allTaskPhotos = await fetchPhotosByLink('task', galleryState.taskId);
            const catPhotos = (allTaskPhotos || []).filter(p => (p.category || 'none') === galleryState.category);
            
            if (catPhotos.length === 0) {
                if (allTaskPhotos && allTaskPhotos.length > 0) {
                    galleryState.category = allTaskPhotos[0].category || 'none';
                    galleryState.photos = allTaskPhotos.filter(p => (p.category || 'none') === galleryState.category);
                    galleryState.allPhotos = allTaskPhotos;
                    galleryState.currentIndex = 0;
                    renderOverlay();
                } else {
                    window.closePhotoGallery();
                }
            } else {
                galleryState.photos = catPhotos;
                galleryState.allPhotos = allTaskPhotos;
                galleryState.currentIndex = Math.min(galleryState.currentIndex, catPhotos.length - 1);
                renderOverlay();
            }
        } catch (err) {
            alert('Ошибка отвязки: ' + err.message);
        }
    });
};

window.openPhotoGallery = openPhotoGallery;
