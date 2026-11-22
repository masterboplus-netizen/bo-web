export function buildPlan(intents, context) {
  const actions = [];
  const errors = [];

  // Проходимся по ВСЕМ интентам, которые вернул Groq
  for (const intent of intents) {
    // Приводим к нижнему регистру на всякий случай
    const rawIntent = (intent.intent || '').toLowerCase().trim();

    if (rawIntent === 'unknown') {
      errors.push('Не понял фразу. Попробуйте переформулировать.');
      continue;
    }

    // Если это просто болтовня
    if (rawIntent === 'chat') {
       actions.push({ tool: 'chat', payload: intent.slots });
       continue;
    }

    // АЛИАСЫ (на случай, если Groq немного ошибся в названии)
    let toolName = rawIntent;
    if (rawIntent === 'create_obj' || rawIntent === 'createobject' || rawIntent === 'add_object') {
      toolName = 'create_object';
    }

    actions.push({ 
      tool: toolName, 
      payload: intent.slots || {} 
    });
  }

  if (errors.length > 0 && actions.length === 0) {
    return { status: 'error', errors };
  }

  return { status: 'ok', actions };
}
