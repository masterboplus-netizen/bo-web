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

    const systemPrompt = `Ты — ИИ-мозг. Преврати текст пользователя в массив JSON-команд.
Ответ должен быть СТРОГО в формате:
{ "intents": [ { "intent": "add_task", "confidence": 0.9, "slots": { "title": "..." } } ] }
- Для болтовни (привет) используй intent "chat" и слот "reply".
- Для создания задач используй intent "add_task".
- Если задач несколько, верни несколько объектов в массиве "intents".`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    })

    if (!response.ok) {
        const errText = await response.text();
        throw new Error("Groq API Error: " + errText);
    }

    const data = await response.json()
    
    // Проверка, что структура правильная
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Некорректный ответ от Groq: " + JSON.stringify(data));
    }

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
