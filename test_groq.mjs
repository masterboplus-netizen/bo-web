const SUPABASE_URL = "https://ruomhtlvyqmaqhqqsfqn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1b21odGx2eXFtYXFocXFzZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTQwMjUsImV4cCI6MjEwODk3MDAyNX0.7FWm5KVmMqyVxNjXMhcGhgzb6nD8aLfie7cxBlohIO4";

async function parseWithGroq(text) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/brain-parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ text, context: { history: [] } })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Ошибка Edge Function: ' + errText);
    }
    const data = await response.json();
    return data.intents || [];
  } catch (err) {
    console.error('[Groq] Ошибка:', err);
    return [];
  }
}

const text = 'Привет';
console.log('--- ТЕСТ GROQ: ' + text + ' ---');
const intents = await parseWithGroq(text);
console.log('Результат от Groq:', JSON.stringify(intents, null, 2));
