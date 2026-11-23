import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq as parseWithGroqDirect } from '../nlu/groq_direct.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);
  const history = context?.history || [];

  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      // ВРЕМЕННО: Идем только в прямой Groq (groq_direct.js),
      // так как Edge Function (brain-parse) пока не обновлена.
      const groqIntents = await parseWithGroqDirect(cleanText, history);
      if (groqIntents && groqIntents.length > 0) {
        intents = groqIntents;
      }
    } catch (e) {
      console.warn('[Мозг] Groq Direct не ответил:', e.message);
      intents = [{ intent: 'error', confidence: 0, slots: { message: e.message } }];
    }
  }
  return intents;
}
