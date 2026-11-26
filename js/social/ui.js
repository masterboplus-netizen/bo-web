import { fetchUserChats, fetchMessages, sendMessageToDB, BOT_ID, CURRENT_USER_ID } from './api.js';
import { MasterBossBrain } from '../brain/index.js';

let currentChat = null;

export async function renderUI(container) {
    if (currentChat) {
        renderChatScreen(container, currentChat);
    } else {
        renderChatList(container);
    }
}

async function renderChatList(container) {
    container.innerHTML = '<div style="padding: 20px; color: var(--fg-dim); text-align: center;">Загрузка чатов...</div>';
    try {
        const chats = await fetchUserChats();
        let html = `<div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
            <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2);"><h3 style="margin: 0; font-size: 20px;">Чаты</h3></div>
            <div style="flex: 1; overflow-y: auto;">`;
        if (chats.length === 0) {
            html += '<div style="padding: 20px; color: var(--fg-dim); text-align: center;">Нет чатов</div>';
        } else {
            chats.forEach(chat => {
                const isBot = chat.type === 'bot';
                const title = isBot ? 'Бо (Ассистент)' : (chat.title || 'Личный чат');
                html += `<div onclick="window.openChat('${chat.id}')" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid var(--border); cursor: pointer; gap: 12px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">🤖</div>
                    <div style="flex: 1;"><div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${title}</div><div style="color: var(--fg-dim); font-size: 14px;">Нажмите, чтобы открыть</div></div>
                </div>`;
            });
        }
        html += '</div></div>';
        container.innerHTML = html;
        window.openChat = (chatId) => { currentChat = chatId; renderUI(container); };
    } catch (e) {
        container.innerHTML = `<div style="color: red; padding: 20px; font-size: 14px;"><b>Ошибка загрузки чатов:</b><br>${e.message}</div>`;
    }
}

async function renderChatScreen(container, chatId) {
    container.innerHTML = '<div style="padding: 20px; color: var(--fg-dim); text-align: center;">Загрузка...</div>';
    try {
        const messages = await fetchMessages(chatId);
        let html = `<div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
            <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 10px;">
                <div onclick="window.closeChat()" style="cursor: pointer; padding: 5px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                <div style="flex: 1;"><div style="font-weight: bold; font-size: 16px;">Чат</div></div>
            </div>
            <div id="social-chat-history" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">`;
        if (messages.length === 0) {
            html += '<div style="text-align: center; color: var(--fg-dim); font-size: 13px; margin-top: 20px;">Нет сообщений</div>';
        } else {
            messages.forEach(msg => {
                const isUser = msg.sender_id === CURRENT_USER_ID;
                const style = isUser
                    ? 'align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 80%; word-wrap: break-word;'
                    : 'align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;';
                html += `<div style="${style}">${msg.text}</div>`;
            });
        }
        html += `</div>
            <div style="padding: 10px 15px; border-top: 1px solid var(--border); background: var(--bg2); display: flex; gap: 10px; align-items: center;">
                <input type="text" id="social-chat-input" placeholder="Написать..." style="flex: 1; padding: 12px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; outline: none;">
                <button id="social-chat-send" style="background: var(--accent); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>`;
        container.innerHTML = html;
        const history = document.getElementById('social-chat-history');
        const input = document.getElementById('social-chat-input');
        const btn = document.getElementById('social-chat-send');
        history.scrollTop = history.scrollHeight;

        btn.onclick = async () => {
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            const msgDiv = document.createElement('div');
            msgDiv.style.cssText = 'align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 80%; word-wrap: break-word;';
            msgDiv.textContent = text;
            history.appendChild(msgDiv);
            history.scrollTop = history.scrollHeight;
            await sendMessageToDB(chatId, CURRENT_USER_ID, text);

            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'chat-loading';
            loadingDiv.style.cssText = 'align-self: flex-start; color: var(--fg-dim); font-style: italic; padding: 10px;';
            loadingDiv.textContent = 'Бо думает...';
            history.appendChild(loadingDiv);
            history.scrollTop = history.scrollHeight;

            let botResponse = '';
            let isNav = false;
            try {
                const result = await MasterBossBrain.handle(text, { tenant_id: 1 });
                document.getElementById('chat-loading')?.remove();
                
                if (result.results && result.results.length > 0) {
                    botResponse = result.results.map(r => r.message).join('<br>');
                    if (result.results.some(r => r.is_navigation)) isNav = true;
                } else if (result.status === 'error') {
                    botResponse = '⚠️ ' + (result.errors ? result.errors.join(', ') : 'Ошибка');
                } else {
                    botResponse = 'Готово';
                }
            } catch (e) {
                document.getElementById('chat-loading')?.remove();
                botResponse = '❌ Ошибка мозга: ' + e.message;
            }

            const botDiv = document.createElement('div');
            botDiv.style.cssText = 'align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;';
            botDiv.innerHTML = botResponse;
            history.appendChild(botDiv);
            history.scrollTop = history.scrollHeight;
            await sendMessageToDB(chatId, BOT_ID, botResponse);

            if (isNav) {
                setTimeout(() => {
                    if (window.closeChat) window.closeChat();
                }, 500);
            }
        };

        window.closeChat = () => { currentChat = null; renderUI(container); };
    } catch (e) {
        container.innerHTML = `<div style="color: red; padding: 20px;">Ошибка загрузки: ${e.message}</div>`;
    }
}
