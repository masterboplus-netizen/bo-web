import { MasterBossBrain } from "../brain_engine.js";
import { BrainTools } from "../brain_tools.js";
import { fetchUserChats, fetchMessages, sendMessageToDB, BOT_ID, CURRENT_USER_ID } from "./api.js";

let currentChat = null;

export async function renderUI(container) {
    if (currentChat) {
        renderChatScreen(container, currentChat);
    } else {
        renderChatList(container);
    }
}

async function renderChatList(container) {
    container.innerHTML = "<div style=\"padding: 20px; color: var(--fg-dim); text-align: center;\">Загрузка чатов...</div>";
    try {
        const chats = await fetchUserChats();

        let html = `
            <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
                <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2);">
                    <h3 style="margin: 0; font-size: 20px;">Чаты</h3>
                </div>
                <div style="flex: 1; overflow-y: auto;">
        `;

        if (chats.length === 0) {
            html += "<div style=\"padding: 20px; color: var(--fg-dim); text-align: center;\">Нет чатов</div>";
        } else {
            chats.forEach(chat => {
                const isBot = chat.type === "bot";
                const title = isBot ? "Бо (Ассистент)" : (chat.title || "Личный чат");
                const iconSvg = isBot
                    ? "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z\"/><circle cx=\"7.5\" cy=\"14.5\" r=\"1.5\"/><circle cx=\"16.5\" cy=\"14.5\" r=\"1.5\"/></svg>"
                    : "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg>";

                html += `
                    <div onclick="window.openChat(\x27\${chat.id}\x27)" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid var(--border); cursor: pointer; gap: 12px;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">
                            \${iconSvg}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">\${title}</div>
                            <div style="color: var(--fg-dim); font-size: 14px;">Нажмите, чтобы открыть</div>
                        </div>
                    </div>
                `;
            });
        }
        html += "</div></div>";
        container.innerHTML = html;

        window.openChat = (chatId) => {
            currentChat = chatId;
            renderUI(container);
        };
    } catch (e) {
        container.innerHTML = \`<div style="color: red; padding: 20px;">Ошибка: \${e.message}</div>\`;
    }
}

async function renderChatScreen(container, chatId) {
    container.innerHTML = "<div style=\"padding: 20px; color: var(--fg-dim); text-align: center;\">Загрузка...</div>";
    try {
        const messages = await fetchMessages(chatId);

        let html = `
            <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg);">
                <div style="padding: 15px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 10px;">
                    <div onclick="window.closeChat()" style="cursor: pointer; padding: 5px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px;">Чат</div>
                    </div>
                </div>
                <div id="social-chat-history" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
        `;

        if (messages.length === 0) {
            html += "<div style=\"text-align: center; color: var(--fg-dim); font-size: 13px; margin-top: 20px;\">Нет сообщений</div>";
        } else {
            messages.forEach(msg => {
                const isUser = msg.sender_id === CURRENT_USER_ID;
                const style = isUser
                    ? "align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 80%; word-wrap: break-word;"
                    : "align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;";
                html += `<div style="\${style}">\${msg.text}</div>`;
            });
        }

        html += `
                </div>
                <div style="padding: 10px 15px; border-top: 1px solid var(--border); background: var(--bg2); display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="social-chat-input" placeholder="Написать..." style="flex: 1; padding: 12px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; outline: none;">
                    <button id="social-chat-send" style="background: var(--accent); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;

        const history = document.getElementById("social-chat-history");
        const input = document.getElementById("social-chat-input");
        const btn = document.getElementById("social-chat-send");

        history.scrollTop = history.scrollHeight;

        btn.onclick = async () => {
            const text = input.value.trim();
            if (!text) return;
            input.value = "";

            const msgDiv = document.createElement("div");
            msgDiv.style.cssText = "align-self: flex-end; background: var(--accent); color: white; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 80%; word-wrap: break-word;";
            msgDiv.textContent = text;
            history.appendChild(msgDiv);
            history.scrollTop = history.scrollHeight;

            await sendMessageToDB(chatId, CURRENT_USER_ID, text);

            let botResponse = "";
            try {
                const plan = MasterBossBrain.plan(text, {});
                if (plan.status !== "ok") {
                    botResponse = "Я не понял запрос. Попробуй переформулировать (например: создай задачу позвонить заказчику).";
                } else {
                    const results = [];
                    for (const intent of plan.plan.intents) {
                        try {
                            const res = await BrainTools.execute(intent.action, intent.payload);
                            results.push({ action: intent.action, status: "ok", data: res });
                        } catch (e) {
                            results.push({ action: intent.action, status: "error", error: e.message });
                        }
                    }
                    botResponse = results.map(r => r.status === "ok" ? "✅ Готово: " + r.action : "❌ Ошибка: " + r.error).join("\n");
                }
            } catch (e) {
                botResponse = "Ошибка связи с мозгом: " + e.message;
            }

            const botDiv = document.createElement("div");
            botDiv.style.cssText = "align-self: flex-start; background: var(--bg3); color: var(--fg); padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 80%; word-wrap: break-word;";
            botDiv.textContent = botResponse;
            history.appendChild(botDiv);
            history.scrollTop = history.scrollHeight;

            await sendMessageToDB(chatId, BOT_ID, botResponse);
        };

        window.closeChat = () => {
            currentChat = null;
            renderUI(container);
        };
    } catch (e) {
        container.innerHTML = \`<div style="color: red; padding: 20px;">Ошибка загрузки: \${e.message}</div>\`;
    }
}
