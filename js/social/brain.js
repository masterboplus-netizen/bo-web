import { parseWithGroq } from '../brain/nlu/groq.js';

export async function handleSocialBrain(text, ctx = {}) {
  // 1. Пытаемся понять через старые правила (если есть)
  // Но так как мы хотим использовать Groq, сразу идем в него
  
  try {
    console.log('[Social Brain] Отправляю в Groq:', text);
    const intents = await parseWithGroq(text);
    
    console.log('[Social Brain] Ответ от Groq:', JSON.stringify(intents));
    if (intents && intents.length > 0) {
      const intent = intents[0];
      console.log('[Social Brain] Первый интент:', JSON.stringify(intent));
      
      // Если это команда (задача, расход, объект)
      if (intent.intent === 'add_task' || intent.intent === 'add_expense' || intent.intent === 'create_object') {
        return { 
          status: 'ok', 
          message: `Понял: ${intent.intent}. Данные: ${JSON.stringify(intent.slots)}` 
        };
      }
      
      // Если это просто чат (болтовня)
      if (intent.intent === 'chat' || intent.message) {
        return { status: 'chat', message: intent.message || 'Привет! Чем могу помочь?' };
      }
    }
    
    return { status: 'chat', message: 'Я не понял запрос. Попробуй переформулировать.' };
    
  } catch (e) {
    console.error('[Social Brain] Ошибка:', e);
    return { status: 'error', message: 'Ошибка связи с мозгом: ' + e.message };
  }
}

// Синоним для старого кода
export const processTextWithBrain = handleSocialBrain;
