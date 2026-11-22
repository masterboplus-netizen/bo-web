import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { text, context } = await req.json()
    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) throw new Error("GROQ_API_KEY не найден")

    // Если в context есть история, передаем её в модель
    const history = context?.history || [];
    
    const systemPrompt = `Ты — крутой ИИ-мозг строительной экосистемы MasterBoss. 
Твоя задача — понимать фразы и превращать их в МАССИВ JSON-команд. У тебя есть память о предыдущих сообщениях.
Если пользователь просто болтает, верни intent "chat" и слот "reply" с коротким деловым ответом.
Если просит открыть экран (задачи, объекты, финансы, календарь, галерея, дневник), верни intent "navigate" и слот "screen" (например: "tasks", "objects", "finance").
Если просит создать задачи: intent "add_task" (слоты: title, deadline, object_name).
Если просит создать объект: intent "create_object" (слоты: name). Если имя не названо — придумай "Объект 1", "Объект 2" и т.д.
Если просит добавить расход: intent "add_expense" (слоты: amount, category).
Если фраза непонятна: intent "unknown".

ОБЯЗАТЕЛЬНО верни СТРОГО JSON в формате: 
{ "intents": [ { "intent": "название", "confidence": 0.9, "slots": { ... } } ] }`

    // Собираем сообщения для Groq (включая историю)
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.text })),
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
