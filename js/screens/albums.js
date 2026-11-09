import { db } from '../api/supabase.js';
import { fetchAlbums, fetchAlbumPreview, fetchAlbumPhotos, createAlbum } from '../api/albums_folders.js';

export async function renderAlbumsTab() {
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
                <div style="display: flex; background: var(--bg2); border-radius: 24px; padding: 4px; border: 1px solid var(--bg3); width: 260px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;">
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

export async function createNewAlbum() {
    const name = prompt('Название альбома:');
    if (!name) return;
    await createAlbum(name, null);
    renderAlbumsTab();
};

export async function openAlbum(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка альбома...</div>';
    try {
        const photos = await fetchAlbumPhotos(id);
        let html = '<div style="padding: 80px 15px 100px 15px; max-width: 800px; margin: 0 auto;">';
        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button onclick="window.switchGalleryTab('albums')" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; font-size: 15px;">← Назад</button>
            <h2 style="color: var(--fg); margin: 0; font-size: 18px;">Альбом</h2>
            <button onclick="window.deleteAlbum(${id})" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; font-size: 15px;">Удалить</button>
        </div>`;
        if (!photos || photos.length === 0) {
            html += '<div style="text-align: center; color: var(--fg-dim); margin-top: 30px;">В альбоме пока нет фото.</div>';
        } else {
            html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">';
            photos.forEach(ph => {
                html += `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #000;">
                    <img src="${ph.photo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    <button onclick="window.removePhotoFromAlbum(${id}, ${ph.id})" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer;">×</button>
                </div>`;
            });
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка: ${err.message}</div>`;
    }
};

export async function removePhotoFromAlbum(albumId, photoId) {
    if (!confirm('Удалить фото из альбома?')) return;
    try {
        const { error } = await db.from('album_photos').delete().eq('album_id', albumId).eq('photo_id', photoId);
        if (error) throw error;
        window.openAlbum(albumId);
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

export async function deleteAlbum(id) {
    if (!confirm('Удалить весь альбом?')) return;
    try {
        const { error } = await db.from('photo_albums').delete().eq('id', id);
        if (error) throw error;
        window.switchGalleryTab('albums');
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

window.renderAlbumsTab = renderAlbumsTab;
window.createNewAlbum = createNewAlbum;
window.openAlbum = openAlbum;
window.removePhotoFromAlbum = removePhotoFromAlbum;
window.deleteAlbum = deleteAlbum;
