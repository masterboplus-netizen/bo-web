import { fetchUserChats, fetchMessages, sendMessageToDB, BOT_ID, CURRENT_USER_ID } from './api.js';
import { db } from '../api/supabase.js';
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
                const iconSvg = isBot
                    ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>'
                    : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
                html += `<div onclick="window.openChat('${chat.id}')" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid var(--border); cursor: pointer; gap: 12px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">${iconSvg}</div>
                    <div style="flex: 1;"><div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${title}</div><div style="color: var(--fg-dim); font-size: 14px;">Нажмите, чтобы открыть</div></div>
                </div>`;
            });
        }
        html += '</div></div>';
        container.innerHTML = html;
        window.openChat = (chatId) => { currentChat = chatId; renderUI(container); };
    } catch (e) {
        console.error('CHAT LIST ERROR:', e);
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
            try {
                // 1. Собираем историю сообщений для контекста (последние 10)
                const historyData = await db.from('messages')
                    .select('sender_id, text')
                    .eq('chat_id', chatId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                // Берем историю в правильном порядке (старые сверху)
                const historyForBrain = historyData.data.reverse().map(m => ({
                    role: m.sender_id === CURRENT_USER_ID ? 'user' : 'assistant',
                    text: m.text
                }));

                // Добавляем последнее сообщение бота (если оно было), чтобы Groq видел вопрос
                // (оно уже есть в базе, но мы его только что сохранили, поэтому оно может быть в конце)
                // Просто убедимся, что история не пустая и заканчивается на ответе бота, если это ответ на уточнение
                if (historyForBrain.length > 0 && historyForBrain[historyForBrain.length - 1].role === 'user') {
                    // Если последнее сообщение — наше, значит, перед ним был ответ бота. Он уже в истории.
                }

                // 2. Отправляем в мозг с контекстом
                const result = await MasterBossBrain.handle(text, { 
                    tenant_id: 1, 
                    object_id: 1, 
                    room_id: 5,
                    history: historyForBrain
                });
                document.getElementById('chat-loading')?.remove();
                
                if (result.status === 'error') {
                    botResponse = '⚠️ Ошибка: ' + (result.errors ? result.errors.join(', ') : 'Неизвестная ошибка');
                } else if (result.results && result.results.length > 0) {
                    botResponse = result.results.map(r => r.status === 'ok' ? '✅ ' + r.message : '⚠️ ' + r.message).join('<br>');
                } else {
                    botResponse = '🤔 Мозг не вернул действий.';
                }
            } catch (e) {
                document.getElementById('chat-loading')?.remove();
                botResponse = '❌ Ошибка связи с мозгом: ' + e.message;
            }

            const botDiv = document.createElement('div');
            botDiv.style.cssText = 'align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;';
            botDiv.innerHTML = botResponse;
            history.appendChild(botDiv);
            history.scrollTop = history.scrollHeight;
            await sendMessageToDB(chatId, BOT_ID, botResponse);
        };

        window.closeChat = () => { currentChat = null; renderUI(container); };
    } catch (e) {
        container.innerHTML = `<div style="color: red; padding: 20px;">Ошибка загрузки: ${e.message}</div>`;
    }
}
