export function showStub(title, tabId) {
    document.getElementById('app-content').innerHTML = `
        <div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">
            <div style="margin-bottom: 20px; display: flex; justify-content: center;">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--fg-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 18h20"></path>
                    <path d="M4 18v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"></path>
                    <path d="M12 10V6"></path>
                    <path d="M12 6l4-2"></path>
                    <path d="M8 10L6 6"></path>
                    <circle cx="7" cy="18" r="2"></circle>
                    <circle cx="17" cy="18" r="2"></circle>
                </svg>
            </div>
            <h3>${title}</h3>
            <p>Раздел в разработке.</p>
        </div>
    `;
    if (tabId && window.setNavActive) window.setNavActive(tabId);
}

window.showStub = showStub;
