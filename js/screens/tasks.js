import { db } from '../api/supabase.js';
import { createCard } from '../ui/card.js'; // Импортируем единую карточку

let currentTasks = [];
let isSelectionMode = false;
let selectedIds = new Set();
let longPressTimer = null;

export async function renderTasks() {
    if (window.setNavActive) window.setNavActive('tasks');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка задач...</div>';

    try {
        const { data: tasks, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        currentTasks = tasks || [];
        drawTasksList();

    } catch (err) {
        console.error(err);
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки задач: ${err.message}</div>`;
    }
}

function drawTasksList() {
    const container = document.getElementById('app-content');
    
    // Создаем контейнер списка
    container.innerHTML = `<div class="task-list" style="padding: 10px; max-width: 600px; margin: 0 auto; padding-bottom: 150px;"></div>`;
    const listEl = container.querySelector('.task-list');

    if (!currentTasks || currentTasks.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Задач пока нет. Создайте первую!</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    currentTasks.forEach(task => {
        let statusColor = task.status === 'done' ? 'var(--fg-dim)' : 'var(--accent)';
        let statusText = task.status === 'done' ? 'Выполнена' : 'В работе';

        let deadlineDisplay = '';
        if (task.deadline_start) {
            deadlineDisplay = new Date(task.deadline_start).toLocaleDateString('ru-RU');
            if (task.deadline_end) {
                deadlineDisplay += ` — ${new Date(task.deadline_end).toLocaleDateString('ru-RU')}`;
            }
        }

        const card = createCard({
            id: task.id,
            title: task.title || 'Без названия',
            subtitle: task.description || null,
            badge: statusText,
            badgeColor: statusColor,
            rightText: deadlineDisplay ? `Срок: ${deadlineDisplay}` : `${new Date(task.created_at).toLocaleDateString('ru-RU')}`,
            isSelectionMode: isSelectionMode,
            isSelected: selectedIds.has(task.id),
            onClick: (id) => {
                if (isSelectionMode) {
                    toggleSelection(id);
                } else {
                    window.openTaskDetail(id);
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

    // Панель кнопок (вставляем в конец body)
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
            drawTasksList();
        };

        bar.querySelector('#delete-selected').onclick = async () => {
            if (selectedIds.size === 0) return;
            window.showConfirm(`Удалить ${selectedIds.size} задач?`, async () => {
                try {
                    const ids = Array.from(selectedIds);
                    const { error } = await db.from('tasks').delete().in('id', ids);
                    if (error) throw error;
                    
                    isSelectionMode = false;
                    selectedIds.clear();
                    renderTasks(); // Перезагружаем список
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
    drawTasksList();
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
    
    drawTasksList();
}
