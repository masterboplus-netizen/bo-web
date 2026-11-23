// Общий компонент карточки
export function createCard({ 
    id, 
    title, 
    subtitle, 
    badge, 
    badgeColor, 
    rightText, 
    onClick, 
    onLongPress,
    isSelectionMode = false,
    isSelected = false
}) {
    const card = document.createElement('div');
    card.className = 'shared-card';
    card.style.cssText = `
        background: var(--bg2);
        border: 1px solid ${isSelected ? 'var(--accent)' : 'var(--bg3)'};
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 10px;
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
        ${isSelectionMode ? 'padding-left: 40px;' : ''}
    `;

    // Чекбокс (если режим выделения)
    if (isSelectionMode) {
        const checkbox = document.createElement('div');
        checkbox.style.cssText = `
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid var(--accent);
            background: ${isSelected ? 'var(--accent)' : 'transparent'};
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        if (isSelected) {
            checkbox.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        }
        card.appendChild(checkbox);
    }

    // Заголовок
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size: 16px; font-weight: bold; color: var(--fg);';
    titleEl.textContent = title || 'Без названия';
    card.appendChild(titleEl);

    // Подзаголовок (если есть)
    if (subtitle) {
        const subEl = document.createElement('div');
        subEl.style.cssText = 'font-size: 13px; color: var(--fg-dim);';
        subEl.textContent = subtitle;
        card.appendChild(subEl);
    }

    // Нижняя строка (бейдж + текст справа)
    const footer = document.createElement('div');
    footer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 4px;';

    if (badge) {
        const badgeEl = document.createElement('span');
        badgeEl.style.cssText = `
            background: ${badgeColor || 'var(--accent)'};
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
        `;
        badgeEl.textContent = badge;
        footer.appendChild(badgeEl);
    } else {
        footer.appendChild(document.createElement('div'));
    }

    if (rightText) {
        const rightEl = document.createElement('span');
        rightEl.style.cssText = 'font-size: 13px; color: var(--fg-dim);';
        rightEl.textContent = rightText;
        footer.appendChild(rightEl);
    }

    card.appendChild(footer);

    // Обработчики
    let longPressTimer = null;

    card.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
            if (onLongPress) onLongPress(id);
        }, 500);
    });

    card.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
    });

    card.addEventListener('touchmove', () => {
        clearTimeout(longPressTimer);
    });

    card.addEventListener('click', (e) => {
        e.preventDefault();
        if (onClick) onClick(id);
    });

    return card;
}

// Функция для отрисовки списка карточек
export function renderCardList(container, items, options) {
    container.innerHTML = '';
    items.forEach(item => {
        const card = createCard({
            ...item,
            ...options
        });
        container.appendChild(card);
    });
}
