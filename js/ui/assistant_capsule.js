import { sendMessageToDB, fetchMessages, getOrCreateBotChat, BOT_ID, CURRENT_USER_ID } from '../social/api.js';

const MAX_HISTORY_MSGS = 5;
const MAX_HISTORY_CHARS = 3000;
const CONTEXT_TIMEOUT_MIN = 15;

let capsuleEl = null;
let botChatId = null;
let isExpanded = false;
let isOpen = false;

export async function initAssistantCapsule() {
    if (capsuleEl) return;
    
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
        z-index: 100000; /* Поднимаем выше навигации */
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s, height 0.3s, bottom 0.3s, border-radius 0.3s;
        overflow: hidden;
    `;

    capsuleEl.innerHTML = `
        <div style="padding: 15px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg2);">
            <div style="font-weight: bold; font-size: 16px; color: var(--fg);">Бо</div>
            <div id="close-assistant" onclick="window.hideAssistant()" style="cursor: pointer; padding: 5px; color: var(--fg-dim);">
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

    // Разворачиваем при фокусе на поле ввода
    input.onfocus = () => expandAssistant();
    input.onblur = () => {
        // Не сворачиваем сразу, чтобы можно было нажать кнопку отправки
        setTimeout(() => {
            if (document.activeElement !== input && document.activeElement !== sendBtn) {
                collapseAssistant();
            }
        }, 100);
    };

    const sendText = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        await sendMessage('user', text);
    };

    sendBtn.onclick = sendText;
    input.onkeydown = (e) => { if (e.key === 'Enter') sendText(); };
}

function expandAssistant() {
    if (!capsuleEl || isExpanded) return;
    isExpanded = true;
    capsuleEl.style.width = '100%';
    capsuleEl.style.maxWidth = '100%';
    capsuleEl.style.height = 'calc(100vh - 80px)'; // Учитываем нижнюю навигацию
    capsuleEl.style.bottom = '80px';
    capsuleEl.style.borderRadius = '0';
    
    // Скрываем нижнюю навигацию и правую капсулу
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    const capsuleWrapper = document.getElementById('floating-capsule-wrapper');
    if (capsuleWrapper) capsuleWrapper.style.display = 'none';
    const fab = document.querySelector('.nav-add-btn');
    if (fab) fab.style.display = 'none';

    // Добавляем в историю состояние, чтобы перехватить кнопку "Назад"
    history.pushState({ assistantOpen: true }, '');
}

function collapseAssistant() {
    if (!capsuleEl || !isExpanded) return;
    isExpanded = false;
    capsuleEl.style.width = 'calc(100% - 120px)';
    capsuleEl.style.maxWidth = '400px';
    capsuleEl.style.height = '60vh';
    capsuleEl.style.bottom = '90px';
    capsuleEl.style.borderRadius = '0 20px 20px 0';

    // Возвращаем нижнюю навигацию и правую капсулу
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'flex';
    const capsuleWrapper = document.getElementById('floating-capsule-wrapper');
    if (capsuleWrapper) capsuleWrapper.style.display = 'flex';
    const fab = document.querySelector('.nav-add-btn');
    if (fab) fab.style.display = 'flex';
}

export async function showAssistant() {
    if (!capsuleEl) await initAssistantCapsule();
    isOpen = true;
    capsuleEl.style.transform = 'translateX(0)';
    await loadHistory();
}

export function hideAssistant() {
    if (!capsuleEl) return;
    if (!capsuleEl) return;
    isOpen = false;
    capsuleEl.style.transform = 'translateX(-100%)';
    collapseAssistant(); // При закрытии возвращаем в обычный вид
}

// Слушатель для кнопки "Назад" (мобильный свайп)
window.addEventListener('popstate', (e) => {
    if (capsuleEl && isExpanded) {
        // Принудительно убираем фокус, чтобы клавиатура закрылась
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        collapseAssistant();
        // Если пользователь нажал "Назад" на клавиатуре (не закрывая виджет), просто сворачиваем
    }
});

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

async function sendMessage(role, text) {
    addMessage(role, text);
    if (botChatId) {
        const senderId = role === 'user' ? CURRENT_USER_ID : BOT_ID;
        await sendMessageToDB(botChatId, senderId, text);
    }
    if (role === 'user') {
        await processBrain(text);
    }
}

async function getSmartContext() {
    return {
        tenant_id: 1,
        screen: localStorage.getItem("currentScreen") || "main"
    };
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
            const context = { tenant_id: 1, object_id: 1, room_id: 5 };
            const shortHistory = context.history ? context.history.slice(-4) : [];
            const result = await window.MasterBossBrain.handle(text, { tenant_id: 1, history: shortHistory });
            document.getElementById('assistant-loading')?.remove();
            
            let botReply = '';
            if (result.status === 'error') {
                botReply = '❌ Ошибка: ' + (result.errors ? result.errors.join(', ') : 'Неизвестная ошибка');
            } else if (result.results && result.results.length > 0) {
                botReply = result.results.map(r => r.status === 'ok' ? '✅ ' + r.message : '⚠️ ' + r.message).join('\n');
            } else {
                botReply = '🤖 Мозг не вернул действий';
            }

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

async function loadHistory() {
    if (!botChatId) return;
    try {
        const messages = await fetchMessages(botChatId);
        const container = document.getElementById('assistant-messages');
        if (!container) return;
        container.innerHTML = '';
        
        if (!messages || messages.length === 0) {
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
    if (isOpen) {
        hideAssistant();
    } else {
        await showAssistant();
    }
};

window.hideAssistant = hideAssistant;
window.showAssistant = showAssistant;
