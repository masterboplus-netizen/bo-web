import { db } from '../api/supabase.js';
import { createCard } from '../ui/card.js';

let currentObjects = [];
let isSelectionMode = false;
let selectedIds = new Set();
let longPressTimer = null;

export function renderObjects(objects) {
    currentObjects = objects;
    const container = document.getElementById('app-content');
    
    container.innerHTML = `<div class="object-list" style="padding-top: 10px; max-width: 600px; margin: 0 auto; padding-bottom: 150px;"></div>`;
    const listEl = container.querySelector('.object-list');

    if (!objects || objects.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет. Создайте первый!</div>`;
    } else {
        const fragment = document.createDocumentFragment();

        objects.forEach(obj => {
            let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
            let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
            const isSelected = selectedIds.has(obj.id);

            const card = createCard({
                id: obj.id,
                title: obj.name,
                subtitle: null, 
                badge: statusText,
                badgeColor: statusColor,
                rightText: `${obj.budget || 0} ₽`,
                isSelectionMode: isSelectionMode,
                isSelected: isSelected,
                onClick: (id) => {
                    if (isSelectionMode) {
                        toggleSelection(id);
                    } else {
                        window.openObject(id);
                    }
                },
                onLongPress: (id) => {
                    if (!isSelectionMode) {
                        enterSelectionMode(id);
                    }
                }
            });

            fragment.appendChild(card);
        });

        listEl.appendChild(fragment);
    }

    const oldBar = document.getElementById('selection-bar');
    if (oldBar) oldBar.remove();

    if (isSelectionMode) {
        const bar = document.createElement('div');
        bar.id = 'selection-bar';
        bar.style.cssText = `position: fixed; bottom: 100px; left: 0; width: 100%; display: flex; justify-content: center; gap: 10px; padding: 0 16px; z-index: 9999; box-sizing: border-box;`;
        bar.innerHTML = `
            <button id="cancel-selection" style="flex: 1; max-width: 180px; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer;">Отмена</button>
            <button id="delete-selected" style="flex: 1; max-width: 180px; padding: 14px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer;">Удалить (${selectedIds.size})</button>
        `;
        document.body.appendChild(bar);

        bar.querySelector('#cancel-selection').onclick = () => {
            isSelectionMode = false;
            selectedIds.clear();
            renderObjects(currentObjects);
        };

        bar.querySelector('#delete-selected').onclick = async () => {
            if (selectedIds.size === 0) return;
            window.showConfirm(`Удалить ${selectedIds.size} объектов?`, async () => {
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
            });
        };
    }
}

function enterSelectionMode(initialId) {
    isSelectionMode = true;
    selectedIds.clear();
    selectedIds.add(initialId);
    renderObjects(currentObjects);
}

function toggleSelection(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    
    if (selectedIds.size === 0) {
        isSelectionMode = false;
    }
    
    renderObjects(currentObjects);
}
