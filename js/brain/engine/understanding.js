import { normalizeText } from '../nlu/normalize.js';
import { applyRules } from '../nlu/rules.js';
import { parseWithGroq } from '../nlu/groq.js';

export async function understand(text, context) {
  const cleanText = normalizeText(text);
  let intents = applyRules(cleanText);

  // Если правила ничего не нашли, пробуем Groq
  if (intents.length === 1 && intents[0].intent === 'unknown') {
    try {
      const groqIntents = await parseWithGroq(cleanText);
      if (groqIntents && groqIntents.length > 0) intents = groqIntents;
    } catch (e) {
      console.warn('[Мозг] Groq не ответил:', e.message);
    }
  }

  // Добавляем проверку на уточнение (например, для задач без объекта)
  for (const intent of intents) {
    if ((intent.intent === 'add_task' || intent.intent === 'add_measure' || intent.intent === 'add_comm') && !intent.slots.object_id) {
      intent.needs_clarification = true;
      intent.clarification_question = 'К какому объекту это добавить?';
    }
  }

  return intents;
}
