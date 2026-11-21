export async function parseWithGroq(text) {
  const apiKey = window.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[Groq Direct] Нет API ключа');
    return [];
  }

  const systemPrompt = `
Ты — крутой ИИ-мозг строительной экосистемы MasterBoss. 
Твоя задача — понимать любые фразы и превращать их в JSON-команды.

⚠️ ВАЖНОЕ ПРАВИЛО: Если в фразе есть НЕСКОЛЬКО действий (например, "создай задачу и добавь щиток"), ты ОБЯЗАН вернуть НЕСКОЛЬКО объектов в массиве "intents". Не склеивай их в одно!

Если просит создать задачу: intent "add_task" (слоты: title).
Если просит создать объект: intent "create_object" (слоты: name).
Если просит добавить расход: intent "add_expense" (слоты: amount, category).
Если просит добавить замер: intent "add_measure" (слоты: length, wall).
Если просит добавить щиток/розетку: intent "add_comm" (слоты: comm_type, size, offset_y).
Если фраза непонятна: intent "unknown".

ОБЯЗАТЕЛЬНО верни СТРОГО JSON в формате: 
{ "intents": [ { "intent": "название", "confidence": 0.9, "slots": { ... } } ] }`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.intents || [];
  } catch (err) {
    console.error('[Groq Direct] Ошибка:', err.message);
    return [];
  }
}
