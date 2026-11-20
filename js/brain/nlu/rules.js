export function applyRules(text) {
  const intents = [];
  const t = text.toLowerCase();

  // 1. Объекты (создай, добавь, можешь создать)
  const objectMatch = t.match(/(?:создай|добавь|можешь\s+создать)\s*(?:новый)?\s*объект\s*(.+)?/i);
  if (objectMatch) {
    // Если название не назвали, ставим дефолтное
    const name = objectMatch[1] ? objectMatch[1].trim() : 'Новый объект ' + new Date().toLocaleDateString();
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name } });
    return intents;
  }

  // 2. Задачи (создай, добавь, надо, нужно, поставь)
  const taskMatch = t.match(/(?:создай|добавь|надо|нужно|поставь)\s*(?:задачу)?\s*(.+)/i);
  if (taskMatch) {
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title: taskMatch[1].trim() } });
    return intents;
  }

  // 3. Расходы
  const expenseMatch = t.match(/(?:потратил|купил|оплатил|расход)\s*(?:(\d+)\s*(?:руб|р|₽|тысяч)?)?\s*(?:на\s+)?(.+)/i);
  if (expenseMatch) {
    intents.push({ 
      intent: 'add_expense', 
      confidence: 0.85, 
      slots: { 
        amount: expenseMatch[1] ? parseInt(expenseMatch[1]) : null, 
        category: expenseMatch[2] ? expenseMatch[2].trim() : 'Прочее' 
      } 
    });
    return intents;
  }

  // Если ничего не подошло — отправляем в Groq (если он подключен) или возвращаем unknown
  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
