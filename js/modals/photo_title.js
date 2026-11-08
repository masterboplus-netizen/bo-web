import { db } from '../api/supabase.js';

export function openEditPhotoTitle(photoId, currentTitle) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; max-height: 80vh; overflow-y: auto; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box;';

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: var(--fg); font-size: 16px;">Название фото</h3>
            <button id="close-photo-title" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div style="margin-bottom: 15px;">
            <input type="text" id="photo-title-input" value="${currentTitle}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
        </div>
        <button onclick="window.savePhotoTitle(${photoId})" style="width: 100%; padding: 10px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer;">Сохранить</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    function close() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('close-photo-title').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

export async function savePhotoTitle(photoId) {
    const title = document.getElementById('photo-title-input').value.trim();

    try {
        const { error } = await db.from('task_photos').update({ title: title || null }).eq('id', photoId);
        if (error) throw error;

        const overlay = document.querySelector('div[style*="z-index: 100000"]');
        if (overlay) overlay.remove();

        setTimeout(() => {
            if (window.renderGallery) window.renderGallery();
            else if (window.openPhotos) window.openPhotos();
        }, 100);
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
}

window.openEditPhotoTitle = openEditPhotoTitle;
window.savePhotoTitle = savePhotoTitle;
