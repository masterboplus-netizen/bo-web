export function buildPlan(intents, context) {
  const actions = [];
  const errors = [];
  const clarifications = [];

  for (const intent of intents) {
    if (intent.intent === 'unknown') {
      errors.push('Не понял фразу. Попробуйте переформулировать.');
      continue;
    }

    // Проверяем, нужен ли контекст для этого действия
    if (intent.intent === 'add_task' || intent.intent === 'add_measure' || intent.intent === 'add_comm') {
      if (!context.object_id && !context.room_id) {
        clarifications.push({
          intent: intent,
          question: 'К какому объекту или комнате это добавить?'
        });
        continue;
      }
    }

    actions.push({ tool: intent.intent, payload: intent.slots });
  }

  if (errors.length > 0) return { status: 'error', errors };
  if (clarifications.length > 0) return { status: 'clarification', clarifications };

  return { status: 'ok', actions };
}
