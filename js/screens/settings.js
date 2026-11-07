import { renderCapsule, CAPSULE_ITEMS } from '../ui/floating_menu.js';

export function openSettings() {
    document.getElementById('app-content').innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <h2 style="color: var(--fg); margin-bottom: 20px;">Настройки</h2>

            <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div onclick="window.openMenuSettings()" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--bg3);">
                    <span style="color: var(--fg);">Настройка меню</span>
                    <span style="color: var(--fg-dim);">Настроить →</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--fg);">Версия приложения</span>
                    <span style="color: var(--fg-dim);">7.1</span>
                </div>
            </div>
        </div>
    `;
    if (window.setNavActive) window.setNavActive('main');
}

export function openMenuSettings() {
    const container = document.getElementById('app-content');
    container.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <button onclick="window.openSettings()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Назад в настройки
            </button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Настройка меню</h2>

            <div style="background: var(--bg2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div onclick="window.openWidgetSettings()" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="color: var(--fg);">Виджет</span>
                    <span style="color: var(--fg-dim);">Настроить →</span>
                </div>
            </div>
        </div>
    `;
}

export function openWidgetSettings() {
    const container = document.getElementById('app-content');
    let savedConfig = JSON.parse(localStorage.getItem('widget_config')) || [];

    if (savedConfig.length === 0) {
        savedConfig = [
            { id: 'nav-personal', enabled: true },
            { id: 'nav-finance', enabled: true },
            { id: 'nav-diary', enabled: true },
            { id: 'nav-calendar', enabled: true },
            { id: 'nav-tasks', enabled: true },
            { id: 'nav-objects', enabled: true }
        ];
        localStorage.setItem('widget_config', JSON.stringify(savedConfig));
    }

    let listHtml = '';
    CAPSULE_ITEMS.forEach(item => {
        const cfgItem = savedConfig.find(c => c.id === item.id);
        const isActive = cfgItem ? cfgItem.enabled : false;
        const bgColor = isActive ? 'var(--accent)' : 'var(--bg3)';
        const circlePos = isActive ? 'left: 24px;' : 'left: 2px;';

        listHtml += `
            <div class="widget-item" data-id="${item.id}" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg2); padding: 12px 15px; margin-bottom: 8px; border-radius: 12px; border: 1px solid var(--bg3);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="color: var(--fg); display: flex; align-items: center; width: 24px; justify-content: center;">${item.icon}</div>
                    <span style="color: var(--fg); font-size: 15px;">${item.title}</span>
                </div>
                <div class="widget-toggle-btn" data-id="${item.id}" style="position: relative; width: 48px; height: 28px; border-radius: 14px; background: ${bgColor}; cursor: pointer; transition: background 0.3s;">
                    <div style="position: absolute; top: 2px; ${circlePos} width: 24px; height: 24px; border-radius: 50%; background: white; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px;">
            <button onclick="window.openMenuSettings()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Назад в настройки меню
            </button>
            <h2 style="color: var(--fg); margin-bottom: 10px;">Настройка виджета</h2>
            <p style="color: var(--fg-dim); font-size: 13px; margin-bottom: 20px;">Выберите до 6 кнопок (плюс кнопка «Меню» всегда первая).</p>
            <p style="color: var(--fg-dim); font-size: 13px; margin-bottom: 20px;">Для изменения порядка зажмите кнопку в самой капсуле на 1.5 секунды.</p>

            <div id="sortable-list">
                ${listHtml}
            </div>
        </div>
    `;

    document.querySelectorAll('.widget-toggle-btn').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const id = toggle.dataset.id;
            let cfg = JSON.parse(localStorage.getItem('widget_config')) || [];
            const activeCount = cfg.filter(c => c.enabled).length;
            const existing = cfg.find(c => c.id === id);
            const isCurrentlyActive = existing ? existing.enabled : false;

            if (!isCurrentlyActive && activeCount >= 6) {
                alert('Максимум 6 кнопок в настройках (плюс Меню = 7 в виджете).');
                return;
            }
            if (isCurrentlyActive && activeCount <= 2) {
                alert('Минимум 3 кнопки в виджете (Меню + хотя бы две).');
                return;
            }

            if (existing) {
                existing.enabled = !existing.enabled;
            } else {
                cfg.push({ id: id, enabled: true });
            }

            localStorage.setItem('widget_config', JSON.stringify(cfg));

            const newState = !isCurrentlyActive;
            toggle.style.background = newState ? 'var(--accent)' : 'var(--bg3)';
            toggle.querySelector('div').style.left = newState ? '24px' : '2px';

            renderCapsule();
        });
    });
}

window.openSettings = openSettings;
window.openMenuSettings = openMenuSettings;
window.openWidgetSettings = openWidgetSettings;
