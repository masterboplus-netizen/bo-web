export function applyRules(text) {
  const intents = [];
  const t = text.toLowerCase().trim();

  // Если фраза содержит "и", считаем её сложной и отдаем в Groq
  if (t.includes(' и ')) {
    return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
  }

  // 1. Задачи (создай задачу X)
  const taskMatch = t.match(/(?:создай|добавь|надо|нужно|поставь)\s*задачу(?:\s+(.+))?/i);
  if (taskMatch) {
    const title = taskMatch[1] ? taskMatch[1].trim() : 'Без названия';
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title } });
    return intents;
  }

  // 2. Замеры стен (от левой стены 24)
  const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/i);
  if (measureMatch) {
    intents.push({
      intent: 'add_measure',
      confidence: 0.8,
      slots: {
        wall: measureMatch[1] ? measureMatch[1] : 'left',
        length: parseInt(measureMatch[2])
      }
    });
    return intents;
  }

  // 3. Коммуникации (щиток, розетка)
  const commMatch = t.match(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/i);
  if (commMatch) {
    const comm_type = commMatch[1].toLowerCase();
    const size = (commMatch[2] && commMatch[3]) ? `${commMatch[2]}x${commMatch[3]}${commMatch[4] ? 'x'+commMatch[4] : ''}` : null;
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    const offset_y = offsetMatch ? parseInt(offsetMatch[1]) : 0;

    intents.push({
      intent: 'add_comm',
      confidence: 0.8,
      slots: { comm_type, size, offset_y, wall: 'left' }
    });
    return intents;
  }

  // 4. Объекты (создай объект X)
  const objectMatch = t.match(/(?:создай|добавь|новый)\s*объект(?:\s+(.+))?/i);
  if (objectMatch) {
    const name = objectMatch[1] ? objectMatch[1].trim() : 'Новый объект ' + new Date().toLocaleDateString();
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name } });
    return intents;
  }

  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
