import { db } from '../api/supabase.js';
import { fetchAllPhotos } from '../api/photos.js';
import { fetchAlbums, fetchFolders, createAlbum, createFolder, fetchAlbumPreview } from '../api/albums_folders.js';


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

window._selectedPhotos = [];
window._selectionMode = false;
window._galleryFilter = 'all';
window._galleryPhotos = [];
window._galleryIndex = 0;

export async function renderPhotos() {
    const currentTab = window._galleryTab || 'photos';
    if (currentTab === 'albums') {
        return renderAlbumsTab();
    }
    if (currentTab === 'folders') {
        return renderFoldersTab();
    }

    if (window.setNavActive) window.setNavActive('photos');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка галереи...</div>';

    try {
        const photos = await fetchAllPhotos();
        window._galleryPhotos = photos || [];

        // Фильтр по категориям
        const filter = window._galleryFilter || 'all';
        let filtered = window._galleryPhotos;

        if (filter !== 'all') {
            filtered = filtered.filter(p => (p.category || 'none') === filter);
        }

        // Рендер
        let html = `
            <div id="gallery-top-overlay" style="position: fixed; top: 110px; left: 0; width: 100%; z-index: 100; padding: 10px 15px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; pointer-events: none; background: linear-gradient(to bottom, var(--bg) 0%, transparent 100%);">
                <div id="gallery-select-info" style="display: none; align-items: center; gap: 10px; pointer-events: auto;">
                    <button onclick="window.exitSelectionMode()" style="background: rgba(255,255,255,0.15); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                    <span id="gallery-select-count" style="color: var(--fg); font-size: 18px; font-weight: bold;">0</span>
                </div>
                <div style="flex: 1; text-align: center; pointer-events: none;">
                    <span id="gallery-current-month" style="color: var(--fg); font-size: 16px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px;">${new Date().toLocaleString('ru-RU', { month: 'long' }).replace(/^./, c => c.toUpperCase())}</span>
                </div>
                <button onclick="window.showGallerySettings()" style="background: rgba(255,255,255,0.15); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; pointer-events: auto;">⋮</button>
            </div>
            <div style="padding: 10px; max-width: 800px; margin: 0 auto; padding-bottom: 100px;">`;
        

        // Фильтр убран

        // Сетка всех фото (без группировки по задачам)
        if (filtered.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Фото пока нет.</div>`;
        } else {
            html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; user-select: none; -webkit-user-select: none;">';
            filtered.forEach((p, idx) => {
                // Находим индекс в общем массиве (для листания)
                const globalIdx = window._galleryPhotos.findIndex(ph => ph.id === p.id);
                html += `<div class="photo-cell" data-photo-id="${p.id}" onmousedown="window.startPhotoLongPress(${p.id}, this)" onmouseup="window.cancelPhotoLongPress()" onmouseleave="window.cancelPhotoLongPress()" ontouchstart="window.startPhotoLongPress(${p.id}, this)" ontouchend="window.cancelPhotoLongPress()" onclick="window.handlePhotoClick(${globalIdx}, ${p.id}, this)" style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; background: #000;"><img src="${p.photo_url}" draggable="false" oncontextmenu="return false;" style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;"><div class="photo-select-circle" style="display: none; position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; background: rgba(0,0,0,0.3);"></div></div>`;
            });
            html += '</div>';
        }

        html += '</div>';
        
        // Плавающая капсула внизу
        const currentTab = window._galleryTab || 'photos';
        html += `
            <div style="position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 15px; box-sizing: border-box; z-index: 10002; pointer-events: none;">
                <div style="display: flex; background: var(--bg2); border-radius: 24px; padding: 4px; border: 1px solid var(--bg3); flex: 0 1 auto; max-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;">
                    <button onclick="window.switchGalleryTab('photos')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: ${currentTab === 'photos' ? 'var(--accent)' : 'transparent'}; color: ${currentTab === 'photos' ? 'white' : 'var(--fg-dim)'}; font-size: 13px; font-weight: ${currentTab === 'photos' ? 'bold' : 'normal'}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Фото
                    </button>
                    <button onclick="window.switchGalleryTab('albums')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: ${currentTab === 'albums' ? 'var(--accent)' : 'transparent'}; color: ${currentTab === 'albums' ? 'white' : 'var(--fg-dim)'}; font-size: 13px; font-weight: ${currentTab === 'albums' ? 'bold' : 'normal'}; cursor: pointer;">Альбомы</button>
                    <button onclick="window.switchGalleryTab('folders')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: ${currentTab === 'folders' ? 'var(--accent)' : 'transparent'}; color: ${currentTab === 'folders' ? 'white' : 'var(--fg-dim)'}; font-size: 13px; font-weight: ${currentTab === 'folders' ? 'bold' : 'normal'}; cursor: pointer;">Папки</button>
                </div>
                <button style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg2); border: 1px solid var(--bg3); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;" onclick="alert('Поиск в разработке')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
        `;

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

// === ПОЛНОЭКРАННАЯ ГАЛЕРЕЯ (независимая от задач) ===
window.openFullGallery = function(index) {
    window._galleryIndex = index;
    renderFullGallery();
};

function renderFullGallery() {
    const photos = window._galleryPhotos;
    const container = document.getElementById('app-content');
    const photo = photos[window._galleryIndex];

    if (!photo) {
        // Если фото нет (удалено или индекс вне диапазона) — сбрасываем индекс и открываем сетку
        window._galleryIndex = 0;
        window.openPhotos();
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
    const currentIdx = catIds.indexOf(photo.category || 'none');
    const prevIdx = (currentIdx - 1 + categories.length) % categories.length;
    const nextIdx = (currentIdx + 1) % categories.length;
    const prevCat = categories[prevIdx];
    const currentCat = categories[currentIdx];
    const nextCat = categories[nextIdx];

    const capsuleHtml = `
        <div style="display: flex; align-items: stretch; background: var(--bg2); border-radius: 20px; border: 1px solid var(--bg3); overflow: hidden; margin-bottom: 15px; height: 50px;">
            <div onclick="window.gallerySwitchCategory('${prevCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">${prevCat.label}</div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: white; background: var(--accent); font-size: 12px; font-weight: bold; line-height: 1.2; overflow: hidden;">${currentCat.label}</div>
            <div onclick="window.gallerySwitchCategory('${nextCat.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; text-align: center; color: var(--fg-dim); font-size: 12px; cursor: pointer; line-height: 1.2; overflow: hidden;">${nextCat.label}</div>
        </div>
    `;

    container.innerHTML = `
        <div style="padding: 0 20px 20px 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="window.openPhotos()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <button onclick="window.galleryDeletePhoto(${photo.id})" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>

            <div style="position: relative; width: 100%; height: 60vh; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <img src="${photo.photo_url}" style="width: 100%; height: 100%; object-fit: contain; display: block;">
            </div>

            <!-- Лента миниатюр -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none;">
                ${photos.map((p, idx) => `
                    <div onclick="window.openFullGallery(${idx})" style="flex-shrink: 0; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid ${idx === window._galleryIndex ? 'var(--accent)' : 'transparent'}; opacity: ${idx === window._galleryIndex ? '1' : '0.6'}; transition: all 0.2s;">
                        <img src="${p.photo_url}" draggable="false" oncontextmenu="return false;" style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;">
                    </div>
                `).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="window.galleryPrev()" style="flex: 1; margin-right: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div style="color: var(--fg-dim); font-size: 14px; margin: 0 15px;">${window._galleryIndex + 1} / ${photos.length}</div>
                <button onclick="window.galleryNext()" style="flex: 1; margin-left: 10px; padding: 14px; background: var(--bg2); color: var(--fg); border: 1px solid var(--bg3); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>

            ${capsuleHtml}
        </div>
    `;
    container.scrollTop = 0;
}

window.galleryPrev = function() {
    window._galleryIndex = (window._galleryIndex - 1 + window._galleryPhotos.length) % window._galleryPhotos.length;
    renderFullGallery();
};

window.galleryNext = function() {
    window._galleryIndex = (window._galleryIndex + 1) % window._galleryPhotos.length;
    renderFullGallery();
};

window.gallerySwitchCategory = async function(catId) {
    // Просто фильтруем фото по категории
    const filtered = window._galleryPhotos.filter(p => (p.category || 'none') === catId);
    if (filtered.length === 0) {
        alert('В этой категории нет фото');
        return;
    }
    // Находим первый индекс в общем массиве
    const firstIdx = window._galleryPhotos.findIndex(p => p.id === filtered[0].id);
    window._galleryIndex = firstIdx;
    renderFullGallery();
};

window.galleryDeletePhoto = function(photoId) {
    const safeId = window.safePhotoId(photoId, 'galleryDeletePhoto');
    if (!safeId) return;
    window.showConfirm('Удалить это фото?', async () => {
        try {
            const { error } = await db.from('task_photos').delete().eq('id', safeId);
            if (error) throw error;
            window._galleryIndex = 0;
            await renderPhotos();
            return;
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

// === РЕЖИМ ВЫДЕЛЕНИЯ ===
window._longPressTimer = null;

window.enableSelectionMode = function() {
    window._selectionMode = true;
    document.body.classList.add('selection-mode');
    const info = document.getElementById('gallery-select-info');
    if (info) info.style.display = 'flex';
    const grid = document.querySelector('#app-content div[style*="grid-template-columns"]');
    if (grid) grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
};

window.disableSelectionMode = function() {
    window._selectionMode = false;
    window._selectedPhotos = [];
    document.body.classList.remove('selection-mode');
    const info = document.getElementById('gallery-select-info');
    if (info) info.style.display = 'none';
    const count = document.getElementById('gallery-select-count');
    if (count) count.textContent = '0';
    const grid = document.querySelector('#app-content div[style*="grid-template-columns"]');
    if (grid) grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    document.querySelectorAll('.photo-select-circle').forEach(c => c.remove());
    document.querySelectorAll('.photo-item-selected').forEach(c => c.classList.remove('photo-item-selected'));
};

window.togglePhotoSelection = function(id, el) {
    if (!window._selectionMode) {
        window.enableSelectionMode();
    }
    const idx = window._selectedPhotos.indexOf(id);
    if (idx === -1) {
        window._selectedPhotos.push(id);
        if (el) el.classList.add('photo-item-selected');
    } else {
        window._selectedPhotos.splice(idx, 1);
        if (el) el.classList.remove('photo-item-selected');
    }
    const count = document.getElementById('gallery-select-count');
    if (count) count.textContent = window._selectedPhotos.length;
    if (window._selectedPhotos.length === 0) {
        window.disableSelectionMode();
    }
};

window.exitSelectionMode = function() {
    window.disableSelectionMode();
};

window.showGallerySettings = function() {
    alert('Настройки галереи (в разработке)');
};

window._longPressTimer = null;

window.startPhotoLongPress = function(id, el) {
    window._longPressTimer = setTimeout(() => {
        window._longPressTimer = null;
        if (!window._selectionMode) {
            window.enableSelectionMode();
        }
        const circle = el.querySelector('.photo-select-circle');
        if (circle) circle.style.display = 'block';
        el.classList.add('photo-item-selected');
        if (window._selectedPhotos.indexOf(id) === -1) {
            window._selectedPhotos.push(id);
        }
        const count = document.getElementById('gallery-select-count');
        if (count) count.textContent = window._selectedPhotos.length;
    }, 500);
};

window.cancelPhotoLongPress = function() {
    if (window._longPressTimer) {
        clearTimeout(window._longPressTimer);
        window._longPressTimer = null;
    }
};

window.handlePhotoClick = function(globalIdx, id, el) {
    if (window._selectionMode) {
        const idx = window._selectedPhotos.indexOf(id);
        const circle = el.querySelector('.photo-select-circle');
        if (idx === -1) {
            window._selectedPhotos.push(id);
            if (circle) circle.style.display = 'block';
            el.classList.add('photo-item-selected');
        } else {
            window._selectedPhotos.splice(idx, 1);
            if (circle) circle.style.display = 'none';
            el.classList.remove('photo-item-selected');
        }
        const count = document.getElementById('gallery-select-count');
        if (count) count.textContent = window._selectedPhotos.length;
        if (window._selectedPhotos.length === 0) {
            window.disableSelectionMode();
        }
    } else {
        window.openFullGallery(globalIdx);
    }
};

// === ВКЛАДКА "АЛЬБОМЫ" ===
async function renderAlbumsTab() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка альбомов...</div>';
    try {
        const albums = await fetchAlbums();
        let html = '<div style="padding: 80px 15px 100px 15px; max-width: 800px; margin: 0 auto;">';
        html += `<button onclick="window.createNewAlbum()" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; margin-bottom: 20px;">+ Создать альбом</button>`;
        if (!albums || albums.length === 0) {
            html += '<div style="text-align: center; color: var(--fg-dim); margin-top: 30px;">Альбомов пока нет.</div>';
        } else {
            html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">';
            for (const a of albums) {
                const previews = await fetchAlbumPreview(a.id);
                const p = previews || [];
                let mosaic = '';
                if (p.length === 0) {
                    mosaic = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--fg-dim); font-size: 40px;">📁</div>';
                } else {
                    mosaic = '<div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 100%; height: 100%; gap: 2px;">';
                    for (let i = 0; i < 4; i++) {
                        if (p[i]) {
                            mosaic += `<img src="${p[i]}" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
                        } else {
                            mosaic += `<div style="background: var(--bg3);"></div>`;
                        }
                    }
                    mosaic += '</div>';
                }
                html += `<div onclick="window.openAlbum(${a.id})" style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); cursor: pointer; overflow: hidden;">
                    <div style="width: 100%; aspect-ratio: 1; overflow: hidden;">${mosaic}</div>
                    <div style="padding: 10px; color: var(--fg); font-size: 14px; text-align: center;">${a.name}</div>
                </div>`;
            }
            html += '</div>';
        }
        html += '</div>';
        
        // Капсула внизу
        html += `
            <div style="position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 15px; box-sizing: border-box; z-index: 10002; pointer-events: none;">
                <div style="display: flex; background: var(--bg2); border-radius: 24px; padding: 4px; border: 1px solid var(--bg3); flex: 0 1 auto; max-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;">
                    <button onclick="window.switchGalleryTab('photos')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Фото</button>
                    <button onclick="window.switchGalleryTab('albums')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: var(--accent); color: white; font-size: 13px; font-weight: bold; cursor: pointer;">Альбомы</button>
                    <button onclick="window.switchGalleryTab('folders')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Папки</button>
                </div>
                <button style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg2); border: 1px solid var(--bg3); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;" onclick="alert('Поиск в разработке')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.createNewAlbum = async function() {
    const name = prompt('Название альбома:');
    if (!name) return;
    await createAlbum(name, null);
    renderAlbumsTab();
};

window.openAlbum = function(id) {
    alert('Открытие альбома ' + id + ' (в разработке)');
};

// === ВКЛАДКА "ПАПКИ" ===
async function renderFoldersTab() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка папок...</div>';
    try {
        const folders = await fetchFolders();
        let html = '<div style="padding: 80px 15px 100px 15px; max-width: 800px; margin: 0 auto;">';
        html += `<button onclick="window.createNewFolder()" style="width: 100%; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; margin-bottom: 20px;">+ Создать папку</button>`;
        if (!folders || folders.length === 0) {
            html += '<div style="text-align: center; color: var(--fg-dim); margin-top: 30px;">Папок пока нет.</div>';
        } else {
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            folders.forEach(f => {
                html += `<div onclick="window.openFolder(${f.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 12px; color: var(--fg);">
                    <span style="font-size: 24px;">📁</span>
                    <span style="font-size: 16px;">${f.name}</span>
                </div>`;
            });
            html += '</div>';
        }
        html += '</div>';
        
        // Капсула внизу
        html += `
            <div style="position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 15px; box-sizing: border-box; z-index: 10002; pointer-events: none;">
                <div style="display: flex; background: var(--bg2); border-radius: 24px; padding: 4px; border: 1px solid var(--bg3); flex: 0 1 auto; max-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;">
                    <button onclick="window.switchGalleryTab('photos')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Фото</button>
                    <button onclick="window.switchGalleryTab('albums')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Альбомы</button>
                    <button onclick="window.switchGalleryTab('folders')" style="flex: 1; padding: 10px 12px; border-radius: 20px; border: none; background: var(--accent); color: white; font-size: 13px; font-weight: bold; cursor: pointer;">Папки</button>
                </div>
                <button style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg2); border: 1px solid var(--bg3); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;" onclick="alert('Поиск в разработке')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
}

window.createNewFolder = async function() {
    const name = prompt('Название папки:');
    if (!name) return;
    await createFolder(name);
    renderFoldersTab();
};

window.openFolder = function(id) {
    alert('Открытие папки ' + id + ' (в разработке)');
};

window.switchGalleryTab = function(tab) {
    window._galleryTab = tab;
    renderPhotos();
};
