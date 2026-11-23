import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { text, history } = await req.json()
    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) throw new Error("GROQ_API_KEY не найден")

    const systemPrompt = `Ты — крутой ИИ-мозг строительной экосистемы MasterBoss. 
Твоя задача — понимать фразы и превращать их в МАССИВ JSON-команд. У тебя есть память о предыдущих сообщениях.

⚠️ КРИТИЧЕСКИ ВАЖНО: Если в фразе не хватает данных для выполнения действия (например, просят создать объект или задачу, но не называют название), ты ОБЯЗАН вернуть интент "clarify" со слотом "question", в котором будет твой вопрос пользователю. НЕ ПРИДУМЫВАЙ названия сам!

Примеры:
- "Создай объект" -> [{"intent": "clarify", "confidence": 1.0, "slots": {"question": "Какое название у объекта?"}}]
- "Создай задачу" -> [{"intent": "clarify", "confidence": 1.0, "slots": {"question": "Какую задачу нужно создать?"}}]
- "Добавь задачу купить плитку" -> [{"intent": "add_task", "confidence": 0.9, "slots": {"title": "купить плитку"}}]

Если пользователь пишет короткий ответ (1-2 слова), и в истории есть твой предыдущий вопрос (например, "Какое название у объекта?"), верни ТОТ интент, который ты уточнял, с этим ответом в качестве слота. Пример: если ты спросил "Какое название у объекта?", а пользователь ответил "Эра", верни [{"intent": "create_object", "slots": {"name": "Эра"}}].

Если пользователь просто болтает, верни intent "chat" и слот "reply" с коротким деловым ответом.
Если просит открыть экран (задачи, объекты, финансы, календарь, галерея, дневник), верни intent "navigate" и слот "screen".
Если просит добавить расход: intent "add_expense" (слоты: amount, category).
Если фраза непонятна: intent "unknown".

ОБЯЗАТЕЛЬНО верни СТРОГО JSON в формате: 
{ "intents": [ { "intent": "название", "confidence": 0.9, "slots": { ... } } ] }`

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map(h => ({ role: h.role, content: h.text })),
      { role: "user", content: text }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    })

    if (!response.ok) {
        const errText = await response.text();
        throw new Error("Groq API Error: " + errText);
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    
    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
