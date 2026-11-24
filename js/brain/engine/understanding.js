import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq as parseWithGroqEdge } from '../nlu/groq.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);
  const history = context?.history || [];

  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      // Идем в Edge Function brain-parse (она обновлена и умеет историю)
      const groqIntents = await parseWithGroqEdge(cleanText, history);
      console.log('[DEBUG] Ответ от Groq:', groqIntents); // ОТЛАДКА
      if (groqIntents && groqIntents.length > 0) {
        intents = groqIntents;
      }
    } catch (e) {
      console.warn('[Мозг] Edge Function не ответила:', e.message);
      intents = [{ intent: 'error', confidence: 0, slots: { message: e.message } }];
    }
  }
  return intents;
}
