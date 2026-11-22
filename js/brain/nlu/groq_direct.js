export async function parseWithGroq(text) {
  const apiKey = window.GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY');
  if (!apiKey) return [];

  const systemPrompt = `
Ты — ИИ-мозг MasterBoss. Разбери фразу на массив действий (интентов).
⚠️ КРИТИЧЕСКИ ВАЖНО: Если в фразе есть "и", запятая, или перечисление действий, ты ОБЯЗАН вернуть НЕСКОЛЬКО объектов в массиве "intents". Каждое действие — отдельный интент!
Примеры:
- "положить плитку и купить шкаф" -> [{"intent":"add_task","slots":{"title":"положить плитку"}}, {"intent":"add_task","slots":{"title":"купить шкаф"}}]
- "заказать шкаф и положить плитку" -> [{"intent":"add_task","slots":{"title":"заказать шкаф"}}, {"intent":"add_task","slots":{"title":"положить плитку"}}]

Если действие не распознано — верни intent "unknown".
Формат ответа: { "intents": [ { "intent": "...", "confidence": 0.9, "slots": { ... } } ] }
`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }],
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
