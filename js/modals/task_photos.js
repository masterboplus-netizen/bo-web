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
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 24px; max-width: 400px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); transform: scale(0.95); transition: transform 0.2s ease;';

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
        buttonsHtml += '<button onclick="window._selectCategory(\'' + cat.id + '\')" id="cat-btn-' + cat.id + '" style="padding: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: ' + (cat.id === 'none' ? 'var(--accent)' : 'var(--bg2)') + '; color: ' + (cat.id === 'none' ? 'white' : 'var(--fg)') + '; font-size: 14px; cursor: pointer; margin-bottom: 8px; width: 100%; text-align: left;">' + cat.label + '</button>';
    });

    modal.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
        '<h3 style="margin: 0; color: var(--fg); font-size: 18px;">В какую категорию добавить?</h3>' +
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
