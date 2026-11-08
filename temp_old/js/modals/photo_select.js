// Логика режима выделения
window._selectedPhotos = new Set();
window._selectMode = false;

window.enterSelectMode = function() {
    window._selectMode = true;
    
    
};

window.exitSelectMode = function() {
    window._selectMode = false;
    window._selectedPhotos.clear();
    
    
    // Сбросить рамки и уменьшение
    document.querySelectorAll('.photo-cell').forEach(el => {
        el.style.transform = '';
        el.style.border = 'none';
        el.classList.remove('selected');
    });
};

window.togglePhotoSelection = function(photoId, el) {
    if (!window._selectMode) return;
    
    if (window._selectedPhotos.has(photoId)) {
        window._selectedPhotos.delete(photoId);
        el.classList.remove('selected');
        el.style.border = 'none';
        el.style.transform = '';
    } else {
        if (window._selectedPhotos.size >= 10) {
            alert('Максимум 10 фото');
            return;
        }
        window._selectedPhotos.add(photoId);
        el.classList.add('selected');
        el.style.border = '2px solid var(--accent)';
        el.style.transform = 'scale(0.9)';
    }
    
    // Обновляем цифру
    const counter = document.getElementById('select-count');
    if (counter) counter.textContent = window._selectedPhotos.size;
    
    // Если ничего не выделено — выходим
    if (window._selectedPhotos.size === 0) {
        window.exitSelectMode();
    }
};

// Обработчик клика/долгого нажатия на фото
window.handlePhotoClick = function(globalIdx, el, photoId) {
    if (window._selectMode) {
        // В режиме выделения — тап добавляет/убирает
        window.togglePhotoSelection(photoId, el);
    } else {
        // Обычный тап — открываем полноэкранную галерею
        window.openFullGallery(globalIdx);
    }
};

// Долгое нажатие (1 сек) на фото
document.addEventListener('pointerdown', function(e) {
    const cell = e.target.closest('.photo-cell');
    if (!cell) return;
    
    const photoId = parseInt(cell.dataset.id);
    if (!photoId) return;
    
    window._longPressTimer = setTimeout(() => {
        if (!window._selectMode) {
            
            window.togglePhotoSelection(photoId, cell);
        }
    }, 1000); // 1 секунда
}, { passive: true });

document.addEventListener('pointerup', function() {
    if (window._longPressTimer) {
        clearTimeout(window._longPressTimer);
        window._longPressTimer = null;
    }
});

document.addEventListener('pointermove', function() {
    if (window._longPressTimer) {
        clearTimeout(window._longPressTimer);
        window._longPressTimer = null;
    }
});


// Отключаем системное контекстное меню на фото
document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.photo-cell')) {
        e.preventDefault();
    }
});
