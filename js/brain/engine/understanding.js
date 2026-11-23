import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq as parseWithGroqDirect } from '../nlu/groq_direct.js';
import { parseWithGroq as parseWithGroqEdge } from '../nlu/groq.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);

  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      // Сначала пробуем основную функцию (Edge Function)
      let groqIntents = await parseWithGroqEdge(cleanText);
      
      // Если Edge Function не ответила, пробуем прямой вызов
      if (!groqIntents || groqIntents.length === 0) {
        console.warn('[Мозг] Edge Function не ответила, пробуем прямой Groq...');
        groqIntents = await parseWithGroqDirect(cleanText);
      }
      if (groqIntents && groqIntents.length > 0) {
        intents = groqIntents;
      }
    } catch (e) {
      console.warn('[Мозг] Groq не ответил:', e.message);
      intents = [{ intent: 'error', confidence: 0, slots: { message: e.message } }];
    }
  }
  return intents;
}
