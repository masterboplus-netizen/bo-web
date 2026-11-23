import { db } from '../api/supabase.js';
import { createCard } from '../ui/card.js';

let currentLogs = [];
let isSelectionMode = false;
let selectedIds = new Set();
let longPressTimer = null;

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// === СПИСОК ЗАПИСЕЙ ===
export async function renderDiary() {
    if (window.setNavActive) window.setNavActive('diary');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка дневника...</div>';

    try {
        const { data: logs, error } = await db.from('task_progress').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        currentLogs = logs || [];
        drawDiaryList();

    } catch (err) {
        console.error(err);
        document.getElementById('app-content').innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки: ${err.message}</div>`;
    }
}

function drawDiaryList() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `<div class="diary-list" style="max-width: 600px; margin: 0 auto; padding: 0 15px 150px 15px;"></div>`;
    const listEl = container.querySelector('.diary-list');

    if (!currentLogs || currentLogs.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Записей пока нет. Нажмите «+», чтобы создать первую.</div>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    currentLogs.forEach(log => {
        const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        
        let details = [];
        if (log.hours) details.push(`${log.hours} ч.`);
        if (log.qty) details.push(`${log.qty} ${log.unit || ''}`);
        const badgeText = details.length > 0 ? details.join(' • ') : null;

        const card = createCard({
            id: log.id,
            title: date, // Дата как заголовок
            subtitle: log.description || 'Без описания',
            badge: badgeText,
            badgeColor: 'var(--accent)',
            rightText: `Задача ID: ${log.task_id}`, // ID задачи справа
            isSelectionMode: isSelectionMode,
            isSelected: selectedIds.has(log.id),
            onClick: (id) => {
                if (isSelectionMode) {
                    toggleSelection(id);
                } else {
                    window.openDiaryEntryDetail(id);
                }
            },
            onLongPress: (id) => {
                if (!isSelectionMode) {
                    enterSelectionMode(id);
                }
            }
        });

        // Добавляем кнопку "К задаче" прямо в карточку (после её создания)
        // Мы находим футер карточки и добавляем туда кнопку
        const footer = card.querySelector('div:last-child'); 
        if (footer && !isSelectionMode) {
            const btn = document.createElement('button');
            btn.style.cssText = 'background: var(--bg3); border: none; color: var(--accent); font-size: 12px; padding: 4px 8px; border-radius: 6px; cursor: pointer; margin-left: 10px;';
            btn.textContent = 'К задаче →';
            btn.onclick = (e) => {
                e.stopPropagation(); // Чтобы не открывалась запись дневника
                window.openTaskDetail(log.task_id);
            };
            footer.appendChild(btn);
        }

        fragment.appendChild(card);
    });

    listEl.appendChild(fragment);

    // Панель кнопок
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
            drawDiaryList();
        };

        bar.querySelector('#delete-selected').onclick = async () => {
            if (selectedIds.size === 0) return;
            window.showConfirm(`Удалить ${selectedIds.size} записей?`, async () => {
                try {
                    const ids = Array.from(selectedIds);
                    const { error } = await db.from('task_progress').delete().in('id', ids);
                    if (error) throw error;
                    
                    isSelectionMode = false;
                    selectedIds.clear();
                    renderDiary(); // Перезагружаем список
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
    drawDiaryList();
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
    
    drawDiaryList();
}

// === ИНФОРМАЦИОННАЯ КАРТОЧКА ЗАПИСИ ===
window.openDiaryEntryDetail = async function(id) {
    const container = document.getElementById('app-content');
    container.style.paddingTop = '0';
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: log, error } = await db.from('task_progress').select('*').eq('id', id).single();
        if (error) throw error;

        let taskTitle = 'Задача ID: ' + log.task_id;
        try {
            const { data: task } = await db.from('tasks').select('title').eq('id', log.task_id).single();
            if (task) taskTitle = task.title;
        } catch(e) {}

        const date = new Date(log.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
                <div style="position: sticky; top: 0; background: var(--bg); z-index: 100; padding: 10px 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); margin-bottom: 15px;">
                    <button onclick="window.openDiary()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 15px; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button onclick="window.openDiaryActions(${log.id})" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 15px; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>

                <h2 style="color: var(--fg); margin: 0 0 10px 0; font-size: 22px;">${date}</h2>

                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); margin-bottom: 15px;">
                    <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Что сделано</div>
                    <div style="color: var(--fg); font-size: 15px; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(log.description || 'Без описания')}</div>
                </div>

                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    ${log.hours ? `<div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); flex: 1;"><div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Часы</div><div style="color: var(--accent); font-size: 18px; font-weight: bold;">${log.hours} ч.</div></div>` : ''}
                    ${log.qty ? `<div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); flex: 1;"><div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Кол-во</div><div style="color: var(--fg); font-size: 18px; font-weight: bold;">${log.qty} ${log.unit || ''}</div></div>` : ''}
                </div>

                <div style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer;" onclick="window.openTaskDetail(${log.task_id})">
                    <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 5px;">Привязано к задаче</div>
                    <div style="color: var(--accent); font-size: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                        <span>${escapeHtml(taskTitle)}</span>
                        <span>→</span>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        alert('Ошибка загрузки записи: ' + err.message);
        window.openDiary();
    }
};
