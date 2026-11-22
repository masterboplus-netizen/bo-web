export function applyRules(text) {
  const t = text.toLowerCase().trim();
  const intents = [];

  if (t.includes('создай задачу') || t.includes('добавь задачу') || t.includes('новая задача')) {
    const title = t.replace(/(?:создай|добавь|новая)\s*задачу\s*/i, '').trim() || 'Без названия';
    intents.push({ intent: 'add_task', confidence: 0.9, slots: { title } });
    return intents;
  }

  if (t.includes('создай объект') || t.includes('добавь объект') || t.includes('новый объект')) {
    const name = t.replace(/(?:создай|добавь|новый)\s*объект\s*/i, '').trim() || 'Новый объект';
    intents.push({ intent: 'create_object', confidence: 0.9, slots: { name } });
    return intents;
  }

  const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней)?\s*стены?\s*(\d+)/i);
  if (measureMatch) {
    intents.push({ intent: 'add_measure', confidence: 0.8, slots: { wall: measureMatch[1] || 'left', length: parseInt(measureMatch[2]) } });
    return intents;
  }

  const commMatch = t.match(/(щиток|розетка|выключатель|труба|кабель)\s*(?:(\d+)\s*[xх×*]\s*(\d+)(?:\s*[xх×*]\s*(\d+))?)?/i);
  if (commMatch) {
    const size = (commMatch[2] && commMatch[3]) ? `${commMatch[2]}x${commMatch[3]}${commMatch[4] ? 'x'+commMatch[4] : ''}` : null;
    const offsetMatch = t.match(/(?:снизу|сверху|от\s+пола|от\s+потолка)\s*(\d+)/i);
    intents.push({ intent: 'add_comm', confidence: 0.8, slots: { comm_type: commMatch[1].toLowerCase(), size, offset_y: offsetMatch ? parseInt(offsetMatch[1]) : 0, wall: 'left' } });
    return intents;
  }

  return [{ intent: 'unknown', confidence: 0.1, slots: { raw: text } }];
}
