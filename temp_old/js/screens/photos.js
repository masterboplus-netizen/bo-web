import { db } from '../api/supabase.js';
import { fetchAllPhotos } from '../api/photos.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' }[m];
    });
}

window._galleryFilter = 'all';
window._galleryPhotos = [];
window._galleryIndex = 0;

export async function renderPhotos() {
    if (window.setNavActive) window.setNavActive('photos');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка галереи...</div>';

    try {
        const photos = await fetchAllPhotos();
        window._galleryPhotos = photos || [];

        const filter = window._galleryFilter || 'all';
        let filtered = window._galleryPhotos;

        if (filter !== 'all') {
            filtered = filtered.filter(p => (p.category || 'none') === filter);
        }

        let html = '<div style="padding: 10px; max-width: 800px; margin: 0 auto; padding-bottom: 100px;">';

        // Верхняя панель
        html += `
            <div style="position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bg3);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="select-exit-btn" onclick="window.exitSelectMode()" style="display: none; background: transparent; border: none; color: var(--fg); cursor: pointer; font-size: 24px; padding: 0;">✕</button>
                    <span id="select-count" style="display: none; color: var(--fg); font-size: 16px; font-weight: bold;">0</span>
                </div>
                <div id="gallery-month" style="font-weight: bold; color: var(--fg); font-size: 16px;">Ноябрь</div>
                <div>
                    <button onclick="window.showStub('Меню', 'photos')" style="background: transparent; border: none; color: var(--fg); font-size: 20px; cursor: pointer;">⋮</button>
                </div>
            </div>
        `;

        if (filtered.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Фото пока нет.</div>`;
        } else {
            html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;">';
            filtered.forEach((p, idx) => {
                const globalIdx = window._galleryPhotos.findIndex(ph => ph.id === p.id);
                html += `<div onclick="window.openFullGallery(${globalIdx})" style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; background: #000;"><img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;"></div>`;
            });
            html += '</div>';
        }

        html += '</div>';
        html += `
            <div style="position: fixed; bottom: 80px; left: 0; width: 100%; display: flex; align-items: center; justify-content: center; gap: 15px; padding: 0 15px; z-index: 100;">
                <div style="display: flex; background: var(--bg2); border-radius: 20px; padding: 4px; border: 1px solid var(--bg3); flex: 1; max-width: 300px;">
                    <button onclick="window.switchGalleryTab('photos')" style="flex: 1; padding: 8px 12px; border-radius: 16px; border: none; background: var(--accent); color: white; font-size: 13px; font-weight: bold; cursor: pointer;">Фото</button>
                    <button onclick="window.switchGalleryTab('albums')" style="flex: 1; padding: 8px 12px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Альбомы</button>
                    <button onclick="window.switchGalleryTab('folders')" style="flex: 1; padding: 8px 12px; border-radius: 16px; border: none; background: transparent; color: var(--fg-dim); font-size: 13px; cursor: pointer;">Папки</button>
                </div>
                <button onclick="window.openPhotoSearch()" style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg2); border: 1px solid var(--bg3); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
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

window.openFullGallery = function(index) {
    window._galleryIndex = index;
    renderFullGallery();
};

function renderFullGallery() {
    const photos = window._galleryPhotos;
    const container = document.getElementById('app-content');
    const photo = photos[window._galleryIndex];

    if (!photo) {
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

            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none;">
                ${photos.map((p, idx) => `
                    <div onclick="window.openFullGallery(${idx})" style="flex-shrink: 0; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid ${idx === window._galleryIndex ? 'var(--accent)' : 'transparent'}; opacity: ${idx === window._galleryIndex ? '1' : '0.6'}; transition: all 0.2s;">
                        <img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
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
    const filtered = window._galleryPhotos.filter(p => (p.category || 'none') === catId);
    if (filtered.length === 0) {
        alert('В этой категории нет фото');
        return;
    }
    const firstIdx = window._galleryPhotos.findIndex(p => p.id === filtered[0].id);
    window._galleryIndex = firstIdx;
    renderFullGallery();
};

window.galleryDeletePhoto = function(photoId) {
    window.showConfirm('Удалить это фото?', async () => {
        try {
            const { error } = await db.from('task_photos').delete().eq('id', photoId);
            if (error) throw error;
            window.openPhotos();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

window.switchGalleryTab = function(tab) {
    if (tab === 'albums') {
        alert('Альбомы: в разработке');
    } else if (tab === 'folders') {
        alert('Папки: в разработке');
    } else {
        window.openPhotos();
    }
};
