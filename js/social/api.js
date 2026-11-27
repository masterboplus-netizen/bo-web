import { db } from '../api/supabase.js';
import { getCurrentUser } from '../api/auth.js';

export const BOT_ID = '1d4c5ee8-abff-4eb3-9ad2-e90f80434e54';

// Получаем текущего пользователя (асинхронно)
export async function getCurrentUserId() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Пользователь не авторизован');
    return user.id;
}

export async function fetchUserChats() {
    const userId = await getCurrentUserId();
    const { data, error } = await db
        .from('chat_members')
        .select(`chat_id, chats (id, title, type)`)
        .eq('profile_id', userId);

    if (error) throw error;

    const hasBotChat = data.find(c => c.chats && c.chats.type === 'bot');
    if (!hasBotChat) {
        await getOrCreateBotChat(userId);
        return fetchUserChats();
    }

    return data.map(item => item.chats).filter(Boolean);
}

export async function getOrCreateBotChat(userId) {
    const { data: existingChats } = await db
        .from('chat_members')
        .select('chat_id, chats!inner(type)')
        .eq('profile_id', userId)
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
        { chat_id: newChat.id, profile_id: userId },
        { chat_id: newChat.id, profile_id: BOT_ID }
    ]);

    return newChat.id;
}

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

export async function sendMessageToDB(chatId, senderId, text) {
    const { error } = await db
        .from('messages')
        .insert([{ chat_id: chatId, sender_id: senderId, text: text }]);

    if (error) throw error;
}
