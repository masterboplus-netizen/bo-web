import { db } from '../api/supabase.js';
import { createCard } from '../ui/card.js';

let isSelectionMode = false;
let selectedIds = new Set();
let currentObjects = [];

export function renderObjects(objects) {
    currentObjects = objects || [];
    const container = document.getElementById('app-content');
    if (!container) return;

    container.innerHTML = '';

    // Создаем контейнер для карточек
    const list = document.createElement('div');
    list.style.cssText = 'padding-top: 10px; max-width: 600px; margin: 0 auto; padding-bottom: 150px;';
    container.appendChild(list);

    if (!currentObjects || currentObjects.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет. Создайте первый!</div>';
        return;
    }

    // Рисуем карточки через общий компонент
    currentObjects.forEach(obj => {
        const statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
        const statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
        
        const card = createCard({
            id: obj.id,
            title: obj.name,
            badge: statusText,
            badgeColor: statusColor,
            rightText: `${obj.budget || 0} ₽`,
            isSelectionMode: isSelectionMode,
            isSelected: selectedIds.has(obj.id),
            onClick: (id) => {
                if (isSelectionMode) {
                    toggleSelection(id);
                } else {
                    if (window.openObject) window.openObject(id);
                }
            },
            onLongPress: (id) => {
                if (!isSelectionMode) {
                    isSelectionMode = true;
                    selectedIds.clear();
                    selectedIds.add(id);
                    renderObjects(currentObjects);
                }
            }
        });
        list.appendChild(card);
    });

    // Панель управления (если в режиме выделения)
    if (isSelectionMode) {
        const panel = document.createElement('div');
        panel.style.cssText = 'position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; justify-content: center; gap: 10px; padding: 0 16px; z-index: 10000; box-sizing: border-box;';
        panel.innerHTML = `
            <button id="cancel-selection" style="flex: 1; max-width: 180px; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer;">Отмена</button>
            <button id="delete-selected" style="flex: 1; max-width: 180px; padding: 14px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer;">Удалить (${selectedIds.size})</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('cancel-selection').onclick = () => {
            isSelectionMode = false;
            selectedIds.clear();
            renderObjects(currentObjects);
        };

        document.getElementById('delete-selected').onclick = async () => {
            if (selectedIds.size === 0) return;
            if (!confirm(`Удалить ${selectedIds.size} объектов?`)) return;

            try {
                const ids = Array.from(selectedIds);
                const { error } = await db.from('objects').delete().in('id', ids);
                if (error) throw error;
                
                isSelectionMode = false;
                selectedIds.clear();
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
    
    // Перерисовываем
    renderObjects(currentObjects);
}
