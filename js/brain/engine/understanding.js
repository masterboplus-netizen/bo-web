import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq } from '../nlu/groq.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);
  const history = context?.history || [];

  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      const groqIntents = await parseWithGroq(cleanText, history);
      if (groqIntents && groqIntents.length > 0) {
        intents = groqIntents;
      }
    } catch (e) {
    }
  }
  return intents;
}
