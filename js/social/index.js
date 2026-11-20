// js/social/index.js
import { renderUI } from './ui.js';

export function renderSocialScreen() {
    const container = document.getElementById('content');
    if (container) {
        renderUI(container);
    } else {
        console.error('[Social] Контейнер #content не найден');
    }
}
