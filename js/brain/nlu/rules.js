// Универсальный реестр обязательных полей (слотов)
const REQUIRED_SLOTS = {
    'create_object': ['name'],
    'add_task': ['title'],
    'add_measure': ['length'],
    'add_comm': ['comm_type'],
    'add_expense': ['amount']
};

function checkSlots(intentName, slots) {
    if (!REQUIRED_SLOTS[intentName]) return true;
    const missing = REQUIRED_SLOTS[intentName].filter(slot => !slots[slot]);
    return missing.length === 0;
}

export function applyRules(text) {
  const t = text.toLowerCase().trim();
  const intents = [];

  // 1. НАВИГАЦИЯ (открытие экранов)
  const navMatch = t.match(/(?:открой|покажи|перейди|зайди|открыть|показать)\s*(?:в\s*)?(объекты|задачи|финансы|дневник|календарь|галерею|меню)/i);
  if (navMatch) {
    let screen = 'objects';
    const target = navMatch[1].toLowerCase();
    if (target === 'задачи') screen = 'tasks';
    else if (target === 'финансы') screen = 'finance';
    else if (target === 'дневник') screen = 'diary';
    else if (target === 'календарь') screen = 'calendar';
    else if (target === 'галерею') screen = 'photos';
    else if (target === 'меню') screen = 'menu';
    
    intents.push({ intent: 'navigate', confidence: 0.95, slots: { screen } });
    return intents;
  }

  // 2. ЗАДАЧИ
  if (t.includes('создай задачу') || t.includes('добавь задачу') || t.includes('новая задача')) {
    const title = t.replace(/(?:создай|добавь|новая)\s*задачу\s*/i, '').trim();
    const slots = { title };
    if (!checkSlots('add_task', slots)) {
        return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
    }
    intents.push({ intent: 'add_task', confidence: 0.9, slots });
    return intents;
  }

  // 3. ОБЪЕКТЫ
  if (t.includes('создай объект') || t.includes('добавь объект') || t.includes('новый объект')) {
    const name = t.replace(/(?:создай|добавь|новый)\s*объект\s*/i, '').trim();
    const slots = { name };
    if (!checkSlots('create_object', slots)) {
        return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
    }
    intents.push({ intent: 'create_object', confidence: 0.9, slots });
    return intents;
  }

  // 4. ЗАМЕРЫ
  const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/i);
  if (measureMatch) {
    const slots = { wall: measureMatch[1] || 'left', length: parseInt(measureMatch[2]) };
    if (!checkSlots('add_measure', slots)) {
        return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
    }
    intents.push({ intent: 'add_measure', confidence: 0.8, slots });
    return intents;
  }

  // 5. КОММУНИКАЦИИ
  const commMatch = t.match(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/i);
  if (commMatch) {
    const size = (commMatch[2] && commMatch[3]) ? `${commMatch[2]}x${commMatch[3]}${commMatch[4] ? 'x'+commMatch[4] : ''}` : null;
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    const slots = { comm_type: commMatch[1].toLowerCase(), size, offset_y: offsetMatch ? parseInt(offsetMatch[1]) : 0, wall: 'left' };
    if (!checkSlots('add_comm', slots)) {
        return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
    }
    intents.push({ intent: 'add_comm', confidence: 0.8, slots });
    return intents;
  }

  // 6. РАСХОДЫ
  const expenseMatch = t.match(/(?:потратил|купил|оплатил|расход|трата)\s*(\d+)?\s*(?:на\s+)?(.+)?/i);
  if (expenseMatch) {
      const amount = expenseMatch[1] ? parseInt(expenseMatch[1]) : null;
      const category = expenseMatch[2] ? expenseMatch[2].trim() : 'Прочее';
      const slots = { amount, category };
      if (!checkSlots('add_expense', slots)) {
          return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
      }
      intents.push({ intent: 'add_expense', confidence: 0.85, slots });
      return intents;
  }

  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
