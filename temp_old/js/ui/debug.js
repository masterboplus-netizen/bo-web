export function logDebug(msg) {
    let panel = document.getElementById('debug-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff3b30; color: white; font-size: 11px; padding: 4px 8px; z-index: 999999; max-height: 150px; overflow-y: auto; font-family: monospace;';
        document.body.appendChild(panel);
    }
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    panel.innerHTML += `[${time}] ${msg}<br>`;
    panel.scrollTop = panel.scrollHeight;
}
window.logDebug = logDebug;
