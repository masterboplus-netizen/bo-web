function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export function renderObjects(objects) {
    let html = `<div class="object-list" style="padding-top: 10px;">`;
    
    if (!objects || objects.length === 0) {
        html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Объектов пока нет. Создайте первый!</div>`;
    } else {
        objects.forEach(obj => {
            let statusColor = obj.status === 'active' ? 'var(--accent)' : 'var(--fg-dim)';
            let statusText = obj.status === 'active' ? 'В работе' : 'Завершен';
            html += `
                <div class="object-card" onclick="window.openObject(${obj.id})">
                    <div class="obj-title">${escapeHtml(obj.name)}</div>
                    <div class="obj-details">
                        <span class="badge" style="background: ${statusColor}">${statusText}</span>
                        <span class="budget">${obj.budget || 0} ₽</span>
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById('app-content').innerHTML = html;
}
