function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export function renderPhotoRibbons(photos, taskId) {
    const categories = [
        { id: 'works', label: 'Работы' },
        { id: 'docs', label: 'Документы' },
        { id: 'questions', label: 'Вопросы' },
        { id: 'drawings', label: 'Чертежи' },
        { id: 'hidden', label: 'Скрытые работы' },
        { id: 'none', label: 'Без категории' }
    ];

    let ribbonsHtml = '';
    categories.forEach(cat => {
        const catPhotos = (photos || []).filter(p => (p.category || 'none') === cat.id);
        if (catPhotos.length === 0) return;

        const previewPhotos = catPhotos.slice(0, 3);
        const moreCount = catPhotos.length - 3;

        let photosHtml = '';
        previewPhotos.forEach(p => {
            photosHtml += `
                <div style="position: relative; flex-shrink: 0; width: 80px; height: 80px;">
                    <img src="${p.photo_url}" onclick="event.stopPropagation(); window.openPhotoGallery(${taskId}, '${cat.id}', ${p.id})" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;">
                    <button onclick="window.deleteTaskPhoto(${p.id}, ${taskId})" style="position: absolute; top: 3px; right: 3px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px;">×</button>
                </div>
            `;
        });

        if (moreCount > 0) {
            photosHtml += `<button onclick="window.openPhotoGallery(${taskId}, '${cat.id}')" style="flex-shrink: 0; width: 80px; height: 80px; border-radius: 8px; border: 1px dashed var(--fg-dim); background: transparent; color: var(--fg-dim); cursor: pointer; font-size: 12px;">Еще (${moreCount})</button>`;
        }

        ribbonsHtml += `
            <div style="margin-bottom: 15px;">
                <div style="color: var(--fg-dim); font-size: 12px; margin-bottom: 8px;">${cat.label}</div>
                <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;">
                    ${photosHtml}
                </div>
            </div>
        `;
    });

    return ribbonsHtml;
}

export function renderWorkLog(logs) {
    if (!logs || logs.length === 0) {
        return '<div style="color: var(--fg-dim); font-size: 14px;">Записей пока нет.</div>';
    }
    return logs.map(function(log) {
        return '<div style="background: var(--bg2); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--accent);">' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">' +
                '<span style="font-size: 12px; color: var(--fg-dim);">' + new Date(log.created_at).toLocaleString('ru-RU') + '</span>' +
                '<span style="font-size: 12px; color: var(--accent); font-weight: bold;">' + (log.hours ? log.hours + ' ч.' : '') + ' ' + (log.qty ? log.qty + ' ' + (log.unit || '') : '') + '</span>' +
            '</div>' +
            '<div style="color: var(--fg); font-size: 14px; white-space: pre-wrap;">' + (log.description || 'Без описания') + '</div>' +
        '</div>';
    }).join('');
}
