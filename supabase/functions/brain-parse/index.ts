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

    const systemPrompt = `Ты — крутой ИИ-мозг строительной экосистемы MasterBoss. 
Твоя задача — понимать любые фразы и превращать их в МАССИВ JSON-команд (если пользователь просит сделать несколько дел сразу).
Если пользователь просто здоровается (привет, как дела), верни intent "chat" и слот "reply" с коротким деловым ответом (например, "Привет! Над чем поработаем?").
Если просит создать задачи: intent "add_task" (слоты: title, deadline, object_name). Если просит несколько задач, верни несколько объектов add_task.
Если просит создать объект: intent "create_object" (слоты: name).
Если просит добавить расход: intent "add_expense" (слоты: amount, category, object_name).

ОБЯЗАТЕЛЬНО верни СТРОГО JSON в формате: 
{ "intents": [ { "intent": "название", "confidence": 0.9, "slots": { ... } }, { "intent": "название2", "confidence": 0.9, "slots": { ... } } ] }`

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
    })

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
