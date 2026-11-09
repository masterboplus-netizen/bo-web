import { db } from '../api/supabase.js';

export function openCategoryPicker(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; max-height: 80vh; overflow-y: auto; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box;';

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
        buttonsHtml += `<button onclick="window._selectCategory('${cat.id}')" id="cat-btn-${cat.id}" style="padding: 10px; border-radius: 8px; border: 1px solid var(--bg3); background: ${cat.id === 'none' ? 'var(--accent)' : 'var(--bg2)'}; color: ${cat.id === 'none' ? 'white' : 'var(--fg)'}; font-size: 14px; cursor: pointer; margin-bottom: 8px; width: 100%; text-align: left;">${cat.label}</button>`;
    });

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: var(--fg); font-size: 16px;">В какую категорию добавить?</h3>
        </div>
        <div id="cat-buttons-container">${buttonsHtml}</div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="window._cancelCategoryPicker()" style="flex: 1; padding: 12px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 15px; cursor: pointer;">Отмена</button>
            <button onclick="window._confirmCategory()" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer;">Сохранить</button>
        </div>
    `;

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
                btn.style.background = (cat.id === catId) ? 'var(--accent)' : 'var(--bg2)';
                btn.style.color = (cat.id === catId) ? 'white' : 'var(--fg)';
            }
        });
    };

    window._cancelCategoryPicker = function() { overlay.remove(); };
    window._confirmCategory = function() { overlay.remove(); callback(selectedCategory); };

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

export async function uploadTaskPhoto(taskId, input) {
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    
    window.openSmartCategoryPicker(files, taskId);
    // Сбрасываем input, чтобы можно было выбрать те же файлы снова
    input.value = '';
}

export async function deleteTaskPhoto(photoId, taskId) {
    if (!photoId || photoId === 'null' || photoId === 'undefined') {
        alert('Ошибка: неверный ID фото');
        return;
    }
    window.showConfirm('Удалить это фото?', async () => {
        try {
            const { error } = await db.from('task_photos').delete().eq('id', photoId);
            if (error) throw error;
            if (window.openTaskDetail && taskId) window.openTaskDetail(taskId);
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
}

window.openSmartCategoryPicker = function(files, taskId) {
    const categories = [
        { id: 'works', label: 'Работы' },
        { id: 'docs', label: 'Документы' },
        { id: 'questions', label: 'Вопросы' },
        { id: 'drawings', label: 'Чертежи' },
        { id: 'hidden', label: 'Скрытые работы' },
        { id: 'none', label: 'Без категории' }
    ];

    let currentFiles = [...files]; // Копируем массив, чтобы можно было удалять

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: 100%; max-width: 500px; max-height: 90vh; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; box-sizing: border-box;';

    modal.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: var(--fg); font-size: 18px;">Добавить фото (${files.length})</h3>
        <div id="smart-picker-list" style="flex: 1; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px;"></div>
        <div style="display: flex; gap: 10px;">
            <button id="smart-picker-cancel" style="flex: 1; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 15px; cursor: pointer;">Отмена</button>
            <button id="smart-picker-save" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer;">Сохранить</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const listContainer = modal.querySelector('#smart-picker-list');

    function renderList() {
        listContainer.innerHTML = '';
        currentFiles.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--bg3);';
            
            row.innerHTML = `
                <img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="flex: 1;">
                    <select data-index="${index}" style="width: 100%; padding: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 6px; font-size: 13px;">
                        ${categories.map(c => `<option value="${c.id}" ${c.id === 'none' ? 'selected' : ''}>${c.label}</option>`).join('')}
                    </select>
                </div>
                <button data-delete="${index}" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; padding: 5px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            // Обработчик удаления (перерисовываем список)
            row.querySelector('[data-delete]').onclick = () => {
                currentFiles.splice(index, 1);
                if (currentFiles.length === 0) {
                    overlay.remove();
                } else {
                    renderList();
                }
            };
            
            listContainer.appendChild(row);
        });
    }

    renderList();

    modal.querySelector('#smart-picker-cancel').onclick = () => overlay.remove();
    
    modal.querySelector('#smart-picker-save').onclick = async () => {
        overlay.remove();
        // Собираем выбранные категории
        const selects = listContainer.querySelectorAll('select');
        // Начинаем загрузку
        for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];
            const category = selects[i] ? selects[i].value : 'none';
            
            try {
                const fileName = `task_${taskId}_${Date.now()}_${i}_${file.name.replace(/\s/g, '_')}`;
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
            } catch (err) {
                console.error('Ошибка при загрузке файла ' + file.name + ': ', err.message);
                // Продолжаем загрузку остальных
            }
        }
        
        // Перерисовываем детали задачи
        if (window.openTaskDetail) window.openTaskDetail(taskId);
    };
};

window.openCategoryPicker = openCategoryPicker;
window.uploadTaskPhoto = uploadTaskPhoto;
window.deleteTaskPhoto = deleteTaskPhoto;
