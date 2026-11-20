import { MasterBossBrain } from '../brain_engine.js';
import { BrainTools } from '../brain_tools.js';

export async function handleSocialBrain(text, ctx = {}) {
  try {
    console.log('[Social Brain] Отправляю в brain_engine:', text);
    const plan = MasterBossBrain.plan(text, ctx);
    console.log('[Social Brain] План:', JSON.stringify(plan));

    if (plan.status !== 'ok') {
      return { status: 'chat', message: 'Я не понял запрос. Попробуй переформулировать (например: "создай задачу позвонить заказчику").' };
    }

    const results = [];
    for (const intent of plan.plan.intents) {
      try {
        const res = await BrainTools.execute(intent.action, intent.payload);
        results.push({ action: intent.action, status: 'ok', data: res });
      } catch (e) {
        results.push({ action: intent.action, status: 'error', error: e.message });
      }
    }

    const message = results.map(r => r.status === 'ok' ? '✅ Готово: ' + r.action : '❌ Ошибка: ' + r.error).join('\n');
    return { status: 'ok', message: message };

  } catch (e) {
    console.error('[Social Brain] Ошибка:', e);
    return { status: 'error', message: 'Ошибка связи с мозгом: ' + e.message };
  }
}

export const processTextWithBrain = handleSocialBrain;
