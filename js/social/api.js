import { db } from '../api/supabase.js';

export const BOT_ID = '1d4c5ee8-abff-4eb3-9ad2-e90f80434e54';
export const CURRENT_USER_ID = '52454226-b4c5-4d97-94ef-df3fa5ad71a2';

// Загружаем все чаты, в которых состоит пользователь
export async function fetchUserChats() {
    const { data, error } = await db
        .from('chat_members')
        .select(`
            chat_id,
            chats (
                id,
                title,
                type
            )
        `)
        .eq('profile_id', CURRENT_USER_ID);

    if (error) throw error;

    // Если нет личного чата с Ботом — создаем его
    const hasBotChat = data.find(c => c.chats && c.chats.type === 'bot');
    if (!hasBotChat) {
        await getOrCreateBotChat();
        return fetchUserChats(); // Перезапрашиваем, чтобы он появился в списке
    }

    return data.map(item => item.chats).filter(Boolean);
}

// Поиск или создание личного чата с Бо
export async function getOrCreateBotChat() {
    const { data: existingChats } = await db
        .from('chat_members')
        .select('chat_id, chats!inner(type)')
        .eq('profile_id', CURRENT_USER_ID)
        .eq('chats.type', 'bot');

    if (existingChats && existingChats.length > 0) {
        return existingChats[0].chat_id;
    }

    const { data: newChat, error: chatError } = await db
        .from('chats')
        .insert([{ type: 'bot' }])
        .select()
        .single();

    if (chatError) throw chatError;

    await db.from('chat_members').insert([
        { chat_id: newChat.id, profile_id: CURRENT_USER_ID },
        { chat_id: newChat.id, profile_id: BOT_ID }
    ]);

    return newChat.id;
}

// Загрузка истории
export async function fetchMessages(chatId) {
    const { data, error } = await db
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data.reverse();
}

// Сохранение
export async function sendMessageToDB(chatId, senderId, text) {
    const { error } = await db
        .from('messages')
        .insert([{ chat_id: chatId, sender_id: senderId, text: text }]);
    
    if (error) throw error;
}
