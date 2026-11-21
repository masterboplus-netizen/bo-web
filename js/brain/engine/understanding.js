import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq } from '../nlu/groq_direct.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);

  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      const groqIntents = await parseWithGroq(cleanText);
      if (groqIntents && groqIntents.length > 0) {
        intents = groqIntents;
      }
    } catch (e) {
      console.warn('[Мозг] Groq не ответил:', e.message);
    }
  }
  return intents;
}
