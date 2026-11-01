import { menuItems } from './menu_items.js';

export function openAddMenu() {
  if (document.getElementById('add-menu-sheet')) return;

  const overlay = document.createElement('div');
  overlay.id = 'add-menu-overlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99998; opacity: 0; transition: opacity 0.3s ease;';

  const sheet = document.createElement('div');
  sheet.id = 'add-menu-sheet';
  sheet.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg2); border-radius: 24px 24px 0 0; z-index: 99999; padding: 24px 16px 32px 16px; box-sizing: border-box; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--border);';

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;';

  menuItems.forEach(item => {
    const btn = document.createElement('div');
    btn.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: var(--bg3); padding: 12px 4px; border-radius: 16px; cursor: pointer; color: var(--fg); transition: background 0.2s;';
    btn.innerHTML = item.svg + `<span style="font-size: 11px; text-align: center; line-height: 1.2;">${item.text}</span>`;
    
    btn.onmouseover = () => btn.style.background = 'var(--border)';
    btn.onmouseout = () => btn.style.background = 'var(--bg3)';
    
    btn.onclick = () => {
      closeMenu();
      item.action();
    };
    grid.appendChild(btn);
  });

  sheet.innerHTML = `<div style="width: 40px; height: 4px; background: var(--fg-dim); border-radius: 2px; margin: 0 auto 8px auto; opacity: 0.3;"></div>
                     <h3 style="margin: 0 0 8px 0; font-size: 18px; color: var(--fg); text-align: center;">Добавить</h3>`;
  sheet.appendChild(grid);
  
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);

  setTimeout(() => {
    overlay.style.opacity = '1';
    sheet.style.transform = 'translateY(0)';
  }, 10);

  function closeMenu() {
    overlay.style.opacity = '0';
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      overlay.remove();
      sheet.remove();
    }, 300);
  }

  overlay.onclick = closeMenu;
}
