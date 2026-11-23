export function buildPlan(intents, context) {
  const actions = [];
  const errors = [];

  for (const intent of intents) {
    const rawIntent = (intent.intent || '').toLowerCase().trim();

    if (rawIntent === 'unknown') {
      errors.push('Не понял фразу. Попробуйте переформулировать.');
      continue;
    }

    // Обработка уточнений (если Groq просит данные)
    if (rawIntent === 'clarify') {
       actions.push({ tool: 'clarify', payload: intent.slots });
       continue;
    }

    if (rawIntent === 'chat') {
       actions.push({ tool: 'chat', payload: intent.slots });
       continue;
    }

    // АЛИАСЫ
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
