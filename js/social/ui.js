import { processTextWithBrain } from './brain.js';
import { sendMessageToDB } from './api.js';

let currentChat = null; // 'bo' или null (список)

export function renderUI(container) {
    if (currentChat === 'bo') {
        renderChatScreen(container);
    } else {
        renderChatList(container);
    }
}

function renderChatList(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
            <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 10px;">
                <h3 style="margin: 0; font-size: 20px;">Чаты</h3>
            </div>
            <div style="flex: 1; overflow-y: auto;">
                <div onclick="window.openBoChat()" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid var(--border); cursor: pointer; gap: 12px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">Бо (Ассистент)</div>
                        <div style="color: var(--fg-dim); font-size: 14px;">Готов к работе</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.openBoChat = () => {
        currentChat = 'bo';
        renderUI(container);
    };
}

function renderChatScreen(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
            <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 10px;">
                <div onclick="window.closeBoChat()" style="cursor: pointer; padding: 5px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 16px;">Бо</div>
                    <div style="color: var(--fg-dim); font-size: 12px;">онлайн</div>
                </div>
            </div>
            
            <div id="social-chat-history" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div style="text-align: center; color: var(--fg-dim); font-size: 13px; margin-top: 20px;">Напишите команду или вопрос</div>
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
            ? 'align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 80%; word-wrap: break-word;' 
            : 'align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;';
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

        // Показываем "печатает..."
        const typing = document.createElement('div');
        typing.style.cssText = 'align-self: flex-start; color: var(--fg-dim); font-size: 14px; font-style: italic; margin-bottom: 10px;';
        typing.textContent = 'Бо печатает...';
        history.appendChild(typing);
        history.scrollTop = history.scrollHeight;

        const brainResult = await processTextWithBrain(text);
        
        history.removeChild(typing);

        if (brainResult.status === 'ok') {
            addMessage('✅ ' + brainResult.message, false);
            sendMessageToDB(brainResult.message, 'bot');
        } else {
            addMessage(brainResult.message, false);
            sendMessageToDB(brainResult.message, 'bot');
        }
    };

    window.closeBoChat = () => {
        currentChat = null;
        renderUI(container);
    };
}
