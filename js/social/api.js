// js/social/api.js
// Здесь будет работа с Supabase (сохранение истории сообщений)
export async function fetchMessages() {
    // Заглушка. Позже добавим запрос к таблице.
    return [];
}
export async function sendMessageToDB(text, role) {
    // Заглушка. Позже добавим insert.
    console.log('DB Save:', role, text);
}
