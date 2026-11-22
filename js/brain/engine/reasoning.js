export function buildPlan(intents, context) {
  const actions = [];
  const errors = [];

  // Проходимся по ВСЕМ интентам, которые вернул Groq
  for (const intent of intents) {
    if (intent.intent === 'unknown') {
      errors.push('Не понял фразу. Попробуйте переформулировать.');
      continue;
    }

    // Если это просто болтовня
    if (intent.intent === 'chat') {
       actions.push({ tool: 'chat', payload: intent.slots });
       continue;
    }

    actions.push({ 
      tool: intent.intent, 
      payload: intent.slots || {} 
    });
  }

  if (errors.length > 0 && actions.length === 0) {
    return { status: 'error', errors };
  }

  return { status: 'ok', actions };
}
