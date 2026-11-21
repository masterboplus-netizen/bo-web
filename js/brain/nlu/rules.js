export function applyRules(text) {
  const intents = [];
  const t = text.toLowerCase();

  const objectMatch = t.match(/(?:создай|добавь|новый)\s*(?:объект)\s*(.+)?/i);
  if (objectMatch) {
    const name = objectMatch[1] ? objectMatch[1].trim() : 'Новый объект ' + new Date().toLocaleDateString();
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name } });
    return intents;
  }

  const taskMatch = t.match(/(?:создай|добавь|надо|нужно|поставь)\s*(?:задачу)?\s*(.+)/i);
  if (taskMatch) {
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title: taskMatch[1].trim() } });
    return intents;
  }

  const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней|левой|правой)?\s*стены?\s*(\d+)/i);
  if (measureMatch) {
    intents.push({
      intent: 'add_measure',
      confidence: 0.8,
      slots: {
        wall: measureMatch[1] ? measureMatch[1] : 'left',
        length: parseInt(measureMatch[2]),
        room_id: 5
      }
    });
    return intents;
  }

  const commMatch = t.match(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×]\s*(\d+))?/i);
  if (commMatch) {
    const comm_type = commMatch[1].toLowerCase();
    const size = (commMatch[2] && commMatch[3]) ? commMatch[2] + 'x' + commMatch[3] : null;
    
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
    return intents;
  }

  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
