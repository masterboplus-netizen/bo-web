import { db } from '../api/supabase.js';

// ID Бота и текущего пользователя (замени на те, что выдал Supabase)
export const BOT_ID = '1d4c5ee8-abff-4eb3-9ad2-e90f80434e54';
export const CURRENT_USER_ID = '52454226-b4c5-4d97-94ef-df3fa5ad71a2';

// Поиск или создание личного чата с Бо
export async function getOrCreateBotChat() {
    // 1. Ищем чат, где есть Бот и текущий пользователь
    const { data: existingChats, error } = await db
        .from('chat_members')
        .select('chat_id, chats!inner(type)')
        .eq('profile_id', CURRENT_USER_ID)
        .eq('chats.type', 'bot');

    if (existingChats && existingChats.length > 0) {
        return existingChats[0].chat_id;
    }

    // 2. Если нет — создаем новый чат
    const { data: newChat, error: chatError } = await db
        .from('chats')
        .insert([{ type: 'bot' }])
        .select()
        .single();

    if (chatError) throw chatError;

    // 3. Добавляем участников (Пользователь + Бот)
    await db.from('chat_members').insert([
        { chat_id: newChat.id, profile_id: CURRENT_USER_ID },
        { chat_id: newChat.id, profile_id: BOT_ID }
    ]);

    return newChat.id;
}

// Загрузка последних 50 сообщений
export async function fetchMessages(chatId) {
    const { data, error } = await db
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data.reverse(); // Возвращаем в правильном порядке (старые сверху)
}

// Отправка сообщения
export async function sendMessageToDB(chatId, senderId, text) {
    const { error } = await db
        .from('messages')
        .insert([{ chat_id: chatId, sender_id: senderId, text: text }]);
    
    if (error) throw error;
}
