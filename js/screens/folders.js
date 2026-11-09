import { db } from '../api/supabase.js';
import { fetchFolders, createFolder } from '../api/albums_folders.js';

export async function renderFoldersTab() {
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
                <div style="display: flex; background: var(--bg2); border-radius: 24px; padding: 4px; border: 1px solid var(--bg3); width: 260px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); pointer-events: auto;">
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

export async function createNewFolder() {
    const name = prompt('Название папки:');
    if (!name) return;
    await createFolder(name);
    renderFoldersTab();
};


export function openFolder(id) {
    alert('Открытие папки ' + id + ' (в разработке)');
}
window.renderFoldersTab = renderFoldersTab;
window.createNewFolder = createNewFolder;
