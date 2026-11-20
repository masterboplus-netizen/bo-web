// js/social/ui.js
// Отрисовка интерфейса
import { processTextWithBrain } from './brain.js';
import { sendMessageToDB } from './api.js';

export function renderUI(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
            <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 10px;">
                <div onclick="window.renderMainMenu()" style="cursor: pointer; padding: 5px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <h3 style="margin: 0; font-size: 18px;">Бо</h3>
            </div>
            <div id="social-chat-history" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div style="text-align: center; color: var(--fg-dim); font-size: 13px; margin-top: 20px;">История сообщений пуста</div>
            </div>
            <div style="padding: 10px 15px; border-top: 1px solid var(--border); background: var(--bg2); display: flex; gap: 10px; align-items: center;">
                <input type="text" id="social-chat-input" placeholder="Написать..." style="flex: 1; padding: 12px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; outline: none;">
                <button id="social-chat-send" style="background: var(--accent); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;

    const input = document.getElementById('social-chat-input');
    const btn = document.getElementById('social-chat-send');
    const history = document.getElementById('social-chat-history');

    function addMessage(text, isUser) {
        const msg = document.createElement('div');
        msg.style.cssText = isUser 
            ? 'align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px; max-width: 80%; word-wrap: break-word;' 
            : 'align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px; max-width: 80%; word-wrap: break-word;';
        msg.textContent = text;
        history.appendChild(msg);
        history.scrollTop = history.scrollHeight;
    }

    btn.onclick = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        
        addMessage(text, true);
        sendMessageToDB(text, 'user');

        const brainResult = await processTextWithBrain(text);
        
        if (brainResult.status === 'ok') {
            addMessage('✅ Выполнено: ' + brainResult.results.map(r => r.action).join(', '), false);
            sendMessageToDB('Выполнено: ' + brainResult.results.map(r => r.action).join(', '), 'bot');
        } else {
            addMessage('❌ ' + brainResult.message, false);
            sendMessageToDB(brainResult.message, 'bot');
        }
    };
}
