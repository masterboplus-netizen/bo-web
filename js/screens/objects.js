import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

let isSelectionMode = false;
let selectedIds = new Set();
let longPressTimer = null;

export function renderObjects(objects) {
    let html = `<div class="object-list" style="padding-top: 10px; max-width: 600px; margin: 0 auto;">`;

    if (!objects || objects.length === 0) {
        html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет. Создайте первый!</div>`;
    } else {
        objects.forEach(obj => {
            let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
            let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
            const isSelected = selectedIds.has(obj.id);
            
            html += `
                <div class="object-card" data-id="${obj.id}" style="position: relative; ${isSelectionMode ? 'padding-left: 40px;' : ''} ${isSelected ? 'border: 2px solid var(--accent);' : ''}">
                    ${isSelectionMode ? `<div style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--accent); background: ${isSelected ? 'var(--accent)' : 'transparent'}; display: flex; align-items: center; justify-content: center;">
        ${isSelected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
    </div>` : ''}
                    <div class="obj-title">${escapeHtml(obj.name)}</div>
                    <div class="obj-details">
                        <span class="badge" style="background: ${statusColor}">${statusText}</span>
                        <span class="budget">${obj.budget || 0} ₽</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;

    if (isSelectionMode) {
        html += `
            <div style="position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; justify-content: center; gap: 10px; padding: 0 16px; z-index: 10000; box-sizing: border-box;">
                <button id="cancel-selection" style="flex: 1; max-width: 180px; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer;">Отмена</button>
                <button id="delete-selected" style="flex: 1; max-width: 180px; padding: 14px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer;">Удалить (${selectedIds.size})</button>
            </div>
        `;
    }

    document.getElementById('app-content').innerHTML = html;

    // Обработчики для карточек
    document.querySelectorAll('.object-card').forEach(card => {
        const id = parseInt(card.getAttribute('data-id'));

        // Обычный клик
        card.onclick = (e) => {
            if (isSelectionMode) {
                toggleSelection(id);
            } else {
                window.openObject(id);
            }
        };

        // Долгое нажатие (для мобилок)
        card.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                if (!isSelectionMode) {
                    isSelectionMode = true;
                    selectedIds.clear();
                    selectedIds.add(id);
                    renderObjects(objects);
                }
            }, 500);
        });

        card.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        card.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    });

    // Кнопки в режиме выделения
    if (isSelectionMode) {
        document.getElementById('cancel-selection').onclick = () => {
            isSelectionMode = false;
            selectedIds.clear();
            renderObjects(objects);
        };

        document.getElementById('delete-selected').onclick = async () => {
            if (selectedIds.size === 0) return;
            const confirm = window.confirm(`Удалить ${selectedIds.size} объектов?`);
            if (!confirm) return;

            try {
                const ids = Array.from(selectedIds);
                const { error } = await db.from('objects').delete().in('id', ids);
                if (error) throw error;
                
                isSelectionMode = false;
                selectedIds.clear();
                // Перезагружаем список
                if (window.openObjects) window.openObjects();
            } catch (e) {
                alert('Ошибка: ' + e.message);
            }
        };
    }
}

function toggleSelection(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    // Перерисовываем карточки (можно оптимизировать, но для простоты так)
    const cards = document.querySelectorAll('.object-card');
    cards.forEach(card => {
        const cardId = parseInt(card.getAttribute('data-id'));
        const isSelected = selectedIds.has(cardId);
        card.style.border = isSelected ? '2px solid var(--accent)' : '';
        const checkmark = card.querySelector('div[style*="border-radius: 50%"]');
        if (checkmark) {
            checkmark.style.background = isSelected ? 'var(--accent)' : 'transparent';
        }
    });
    // Обновляем текст кнопки удаления
    const delBtn = document.getElementById('delete-selected');
    if (delBtn) delBtn.textContent = `Удалить (${selectedIds.size})`;
}
