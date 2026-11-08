import { db } from '../api/supabase.js';

export function openPhotoSearch() {
    const overlay = document.createElement('div');
    overlay.id = 'photo-search-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg); z-index: 100000; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    overlay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-top: 20px;">
            <button id="close-search" style="background: transparent; border: none; color: var(--fg); cursor: pointer; padding: 10px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <input type="text" id="search-input" placeholder="Поиск фото..." style="flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); font-size: 16px; outline: none;">
        </div>
        <div id="search-results" style="flex: 1; overflow-y: auto;">
            <div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Введите название для поиска</div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => { overlay.style.opacity = '1'; }, 10);

    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    document.getElementById('close-search').onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    };

    input.focus();

    input.oninput = async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            results.innerHTML = '<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Введите минимум 2 символа</div>';
            return;
        }

        try {
            const { data: photos, error } = await db.from('task_photos').select('*').ilike('title', '%' + query + '%').limit(50);
            if (error) throw error;

            if (!photos || photos.length === 0) {
                results.innerHTML = '<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Ничего не найдено</div>';
                return;
            }

            let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">';
            photos.forEach(p => {
                html += `<div onclick="window.openPhotoFromSearch('${p.photo_url}')" style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer;"><img src="${p.photo_url}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
            });
            html += '</div>';
            results.innerHTML = html;
        } catch (err) {
            results.innerHTML = '<div style="text-align: center; color: red; margin-top: 50px;">Ошибка: ' + err.message + '</div>';
        }
    };
}

window.openPhotoSearch = openPhotoSearch;

window.openPhotoFromSearch = function(url) {
    window.open(url, '_blank');
};
