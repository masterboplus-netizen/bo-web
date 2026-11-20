// js/social/index.js
import { renderUI } from './ui.js';

export function renderSocialScreen() {
    const container = document.getElementById('app-content');
    if (container) {
        renderUI(container);
    }
}
