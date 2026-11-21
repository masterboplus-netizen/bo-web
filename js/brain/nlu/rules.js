export function applyRules(text) {
  const t = text.toLowerCase().trim();

  // Если фраза содержит "и" или запятую, отдаем в Groq
  if (t.includes(' и ') || t.includes(',')) {
    return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
  }

  // 1. Задачи (создай задачу X)
  if (t.includes('создай задачу') || t.includes('добавь задачу')) {
    const title = t.replace(/(?:создай|добавь|надо|нужно|поставь)\s*задачу\s*/i, '').trim() || 'Без названия';
    return [{ intent: 'add_task', confidence: 0.9, slots: { title } }];
  }

  // 2. Замеры стен
  const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/i);
  if (measureMatch) {
    return [{ intent: 'add_measure', confidence: 0.8, slots: { wall: measureMatch[1] || 'left', length: parseInt(measureMatch[2]) } }];
  }

  // 3. Коммуникации (щиток, розетка)
  const commMatch = t.match(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/i);
  if (commMatch) {
    const size = (commMatch[2] && commMatch[3]) ? `${commMatch[2]}x${commMatch[3]}${commMatch[4] ? 'x'+commMatch[4] : ''}` : null;
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    return [{ intent: 'add_comm', confidence: 0.8, slots: { comm_type: commMatch[1].toLowerCase(), size, offset_y: offsetMatch ? parseInt(offsetMatch[1]) : 0, wall: 'left' } }];
  }

  // 4. Объекты (создай объект X)
  if (t.includes('создай объект') || t.includes('добавь объект')) {
    const name = t.replace(/(?:создай|добавь|новый)\s*объект\s*/i, '').trim() || 'Новый объект';
    return [{ intent: 'create_object', confidence: 0.9, slots: { name } }];
  }

  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
