export function showConfirm(message, onConfirm) {
    window.logDebug('showConfirm start: ' + message);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: var(--bg2); border-radius: 16px; padding: 16px; width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box; transform: scale(0.95); transition: transform 0.2s ease; margin: 0 auto;';

    modal.innerHTML = `
        <div style="color: var(--fg); font-size: 14px; margin-bottom: 12px; text-align: center; line-height: 1.4;">${message}</div>
        <div style="display: flex; gap: 10px;">
            <button id="confirm-cancel" style="flex: 1; padding: 12px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 14px; cursor: pointer; font-weight: 500;">Отмена</button>
            <button id="confirm-ok" style="flex: 1; padding: 12px; background: #ff3b30; color: white; border: none; border-radius: 10px; font-size: 14px; cursor: pointer; font-weight: bold;">Удалить</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    function close() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('confirm-cancel').onclick = close;
    document.getElementById('confirm-ok').onclick = () => {
        close();
        window.logDebug('showConfirm: calling onConfirm');
        onConfirm();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };
}

window.showConfirm = showConfirm;
