export async function parseWithGroq(text, history = []) {
  const apiKey = window.GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY');
  if (!apiKey) return [];

  const systemPrompt = `
Ты — ИИ-мозг MasterBoss. Разбери фразу на массив действий (интентов).
⚠️ КРИТИЧЕСКИ ВАЖНО: Если в фразе не хватает данных для выполнения действия (например, просят создать объект или задачу, но не называют название), ты ОБЯЗАН вернуть интент "clarify" со слотом "question", в котором будет твой вопрос пользователю. НЕ ПРИДУМЫВАЙ названия сам!

Примеры:
- "Создай объект" -> [{"intent": "clarify", "confidence": 1.0, "slots": {"question": "Какое название у объекта?"}}]
- "Создай задачу" -> [{"intent": "clarify", "confidence": 1.0, "slots": {"question": "Какую задачу нужно создать?"}}]
- "Добавь задачу купить плитку" -> [{"intent": "add_task", "confidence": 0.9, "slots": {"title": "купить плитку"}}]
- "положить плитку и купить шкаф" -> [{"intent": "add_task", "slots": {"title": "положить плитку"}}, {"intent": "add_task", "slots": {"title": "купить шкаф"}}]

Если действие не распознано — верни intent "unknown".
Формат ответа: { "intents": [ { "intent": "...", "confidence": 0.9, "slots": { ... } } ] }
`

  // Собираем сообщения для Groq (включая историю)
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.text })),
    { role: "user", content: text }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.intents || [];
  } catch (err) {
    console.error('[Groq Direct] Ошибка:', err.message);
    throw new Error('Ошибка API: ' + err.message);
  }
}
