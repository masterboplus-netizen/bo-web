import { sendMessageToDB, fetchMessages, getOrCreateBotChat, BOT_ID, CURRENT_USER_ID } from '../social/api.js';

let capsuleEl = null;
let botChatId = null;

export async function initAssistantCapsule() {
    if (capsuleEl) return;
    
    // Получаем или создаем чат с Бо
    try {
        botChatId = await getOrCreateBotChat();
    } catch (e) {
        console.error('Ошибка получения чата Бо:', e);
    }

    capsuleEl = document.createElement('div');
    capsuleEl.id = 'assistant-capsule';
    capsuleEl.style.cssText = `
        position: fixed;
        left: 0;
        bottom: 90px;
        width: calc(100% - 120px);
        max-width: 400px;
        height: 60vh;
        background: var(--bg3);
        border: 1px solid var(--border);
        border-radius: 0 20px 20px 0;
        box-shadow: 4px 0 24px rgba(0,0,0,0.6);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    `;

    capsuleEl.innerHTML = `
        <div style="padding: 15px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg2);">
            <div style="font-weight: bold; font-size: 16px; color: var(--fg);">Бо (Ассистент)</div>
            <div id="close-assistant" style="cursor: pointer; padding: 5px; color: var(--fg-dim);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
        </div>
        <div id="assistant-messages" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;"></div>
        <div style="padding: 10px; border-top: 1px solid var(--border); background: var(--bg2); display: flex; gap: 10px;">
            <input type="text" id="assistant-input" placeholder="Написать..." style="flex: 1; padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 14px; outline: none;">
            <button id="assistant-send" style="background: var(--accent); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    `;

    document.body.appendChild(capsuleEl);

    document.getElementById('close-assistant').onclick = () => hideAssistant();
    const input = document.getElementById('assistant-input');
    const sendBtn = document.getElementById('assistant-send');
    const sendText = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        await sendMessage('user', text);
    };
    sendBtn.onclick = sendText;
    input.onkeydown = (e) => { if (e.key === 'Enter') sendText(); };
}

export async function showAssistant() {
    if (!capsuleEl) await initAssistantCapsule();
    capsuleEl.style.transform = 'translateX(0)';
    await loadHistory(); // Загружаем историю при открытии
}

export function hideAssistant() {
    if (!capsuleEl) return;
    capsuleEl.style.transform = 'translateX(-100%)';
}

// Добавление сообщения в DOM (визуально)
export function addMessage(role, text) {
    if (!capsuleEl) return;
    const container = document.getElementById('assistant-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    const isUser = role === 'user';
    msgDiv.style.cssText = isUser
        ? 'align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 85%; font-size: 14px; word-wrap: break-word;'
        : 'align-self: flex-start; background: var(--bg2); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 85%; font-size: 14px; word-wrap: break-word; border: 1px solid var(--border);';
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// Отправка сообщения (сохраняет в БД и вызывает Мозг)
async function sendMessage(role, text) {
    // 1. Визуально добавляем
    addMessage(role, text);

    // 2. Сохраняем в БД
    if (botChatId) {
        const senderId = role === 'user' ? CURRENT_USER_ID : BOT_ID;
        await sendMessageToDB(botChatId, senderId, text);
    }

    // 3. Если это сообщение от пользователя — вызываем Мозг
    if (role === 'user') {
        await processBrain(text);
    }
}

async function processBrain(text) {
    const container = document.getElementById('assistant-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'assistant-loading';
    loadingDiv.style.cssText = 'align-self: flex-start; color: var(--fg-dim); font-style: italic; padding: 10px; font-size: 14px;';
    loadingDiv.textContent = 'Бо думает...';
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;

    try {
        if (window.MasterBossBrain && window.MasterBossBrain.handle) {
            const result = await window.MasterBossBrain.handle(text, { tenant_id: 1 });
            document.getElementById('assistant-loading')?.remove();
            
            let botReply = '';
            if (result.status === 'error') {
                botReply = '❌ Ошибка: ' + (result.errors ? result.errors.join(', ') : 'Неизвестная ошибка');
            } else if (result.results && result.results.length > 0) {
                botReply = result.results.map(r => r.status === 'ok' ? '✅ ' + r.message : '⚠️ ' + r.message).join('\n');
            } else {
                botReply = '🤖 Мозг не вернул действий';
            }

            // Отправляем ответ Бо (он сохранится в БД)
            await sendMessage('bot', botReply);
        } else {
            document.getElementById('assistant-loading')?.remove();
            await sendMessage('bot', '❌ Мозг не загружен');
        }
    } catch (e) {
        document.getElementById('assistant-loading')?.remove();
        await sendMessage('bot', '❌ Ошибка связи: ' + e.message);
    }
}

// Загрузка истории из БД при открытии
async function loadHistory() {
    if (!botChatId) return;
    try {
        const messages = await fetchMessages(botChatId);
        const container = document.getElementById('assistant-messages');
        if (!container) return;
        container.innerHTML = ''; // Очищаем перед загрузкой
        
        if (messages.length === 0) {
            addMessage('bot', 'Привет! Я Бо. Чем могу помочь?');
        } else {
            messages.forEach(msg => {
                const isUser = msg.sender_id === CURRENT_USER_ID;
                addMessage(isUser ? 'user' : 'bot', msg.text);
            });
        }
    } catch (e) {
        console.error('Ошибка загрузки истории:', e);
    }
}

window.openAssistantWithText = async (text) => {
    await showAssistant();
    await sendMessage('user', text);
};

window.openAssistant = async () => {
    await showAssistant();
};
