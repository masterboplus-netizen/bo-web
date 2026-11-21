export function applyRules(text) {
  const intents = [];
  const t = text.toLowerCase();

  // 1. Задачи (ищем "создай задачу" или "добавь задачу")
  const taskMatch = t.match(/(?:создай|добавь|надо|нужно|поставь)\s*(?:задачу)?\s*(.+?)(?:\s+и\s+|\s*$)/i);
  if (taskMatch && taskMatch[1].trim()) {
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title: taskMatch[1].trim() } });
  }

  // 2. Замеры стен (например: "от левой стены 24")
  const measureMatches = t.matchAll(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/gi);
  for (const match of measureMatches) {
    intents.push({
      intent: 'add_measure',
      confidence: 0.8,
      slots: {
        wall: match[1] ? match[1] : 'left',
        length: parseInt(match[2]),
        room_id: 5 // Временно, пока нет контекста комнаты
      }
    });
  }

  // 3. Коммуникации (щитки, розетки, выключатели)
  const commMatches = t.matchAll(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/gi);
  for (const match of commMatches) {
    const comm_type = match[1].toLowerCase();
    const size = (match[2] && match[3]) ? `${match[2]}x${match[3]}${match[4] ? 'x'+match[4] : ''}` : null;
    
    // Ищем смещение (снизу 187 или от пола 187)
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    const offset_y = offsetMatch ? parseInt(offsetMatch[1]) : 0;

    intents.push({
      intent: 'add_comm',
      confidence: 0.8,
      slots: {
        comm_type: comm_type,
        size: size,
        offset_y: offset_y,
        wall: 'left',
        room_id: 5
      }
    });
  }

  // 4. Объекты (создай объект)
  const objectMatch = t.match(/(?:создай|добавь|новый)\s*(?:объект)\s*(.+?)(?:\s+и\s+|\s*$)/i);
  if (objectMatch && objectMatch[1].trim()) {
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name: objectMatch[1].trim() } });
  }

  // Если ничего не нашли
  if (intents.length === 0) {
    return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
  }
  
  return intents;
}
