export function applyRules(text) {
  const intents = [];
  const t = text.toLowerCase();

  // 1. Задачи (создай задачу X)
  const taskMatches = t.matchAll(/(?:создай|добавь|надо|нужно|поставь)\s*задачу(?:\s+(.+?))?(?:\s+и\s+|\s*$)/gi);
  for (const match of taskMatches) {
    // Если названия нет — ставим дефолт
    const title = match[1] ? match[1].trim() : 'Без названия';
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title } });
  }

  // 2. Замеры стен (от левой стены 24)
  const measureMatches = t.matchAll(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/gi);
  for (const match of measureMatches) {
    intents.push({
      intent: 'add_measure',
      confidence: 0.8,
      slots: {
        wall: match[1] ? match[1] : 'left',
        length: parseInt(match[2])
      }
    });
  }

  // 3. Коммуникации (щиток, розетка, выключатель)
  const commMatches = t.matchAll(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/gi);
  for (const match of commMatches) {
    const comm_type = match[1].toLowerCase();
    const size = (match[2] && match[3]) ? `${match[2]}x${match[3]}${match[4] ? 'x'+match[4] : ''}` : null;
    
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    const offset_y = offsetMatch ? parseInt(offsetMatch[1]) : 0;

    intents.push({
      intent: 'add_comm',
      confidence: 0.8,
      slots: {
        comm_type: comm_type,
        size: size,
        offset_y: offset_y,
        wall: 'left'
      }
    });
  }

  // 4. Объекты (создай объект X)
  const objectMatches = t.matchAll(/(?:создай|добавь|новый)\s*объект(?:\s+(.+?))?(?:\s+и\s+|\s*$)/gi);
  for (const match of objectMatches) {
    const name = match[1] ? match[1].trim() : 'Новый объект ' + new Date().toLocaleDateString();
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name } });
  }

  // Если ничего не нашли
  if (intents.length === 0) {
    return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
  }
  
  return intents;
}
