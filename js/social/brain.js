import { MasterBossBrain } from '../brain/index.js';

export async function handleSocialBrain(text, ctx = {}) {
  try {
    console.log('[Social Brain] Отправляю в MasterBossBrain:', text);
    const result = await MasterBossBrain.handle(text, ctx);
    console.log('[Social Brain] Ответ от мозга:', JSON.stringify(result));

    // Если мозг понял команду
    if (result.status === 'ok' || result.status === 'completed') {
      let message = '✅ Готово!';
      if (result.results && result.results.length > 0) {
        message = result.results.map(r => r.message).join('\n');
      }
      return { status: 'ok', message: message };
    }

    // Если мозг не понял — отвечаем как чат (приветствие)
    if (result.status === 'error') {
      // Проверяем, не приветствие ли это
      const lower = text.toLowerCase().trim();
      if (['привет', 'здравствуй', 'хай', 'hello', 'hi'].includes(lower)) {
        return { status: 'chat', message: 'Привет! Я MasterBoss. Могу создавать задачи, расходы, объекты, замеры. Что делаем?' };
      }
      return { status: 'chat', message: 'Я не понял запрос. Попробуй переформулировать (например: "создай задачу позвонить заказчику").' };
    }

    return { status: 'chat', message: 'Я не понял запрос. Попробуй переформулировать.' };

  } catch (e) {
    console.error('[Social Brain] Ошибка:', e);
    return { status: 'error', message: 'Ошибка связи с мозгом: ' + e.message };
  }
}

// Синоним для старого кода
export const processTextWithBrain = handleSocialBrain;
