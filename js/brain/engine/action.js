import { db } from '../api/supabase.js';

export async function executeActions(plan, context) {
  const results = [];
  const tenant_id = context.tenant_id || 1;

  for (const action of plan.actions) {
    try {
      let result;

      if (action.tool === 'create_object') {
        result = await db.from('objects').insert([{ name: action.payload.name, tenant_id }]).select();
        results.push({ status: 'ok', message: 'Объект создан: ' + action.payload.name });

      } else if (action.tool === 'add_task') {
        result = await db.from('tasks').insert([{ title: action.payload.title, status: 'open', priority: 'medium', tenant_id }]).select();
        results.push({ status: 'ok', message: 'Задача создана: ' + action.payload.title });

      } else if (action.tool === 'add_measure') {
        result = await db.from('room_measures').insert([{
          room_id: action.payload.room_id || 5,
          tenant_id,
          wall_pos: action.payload.wall || 'left',
          length: action.payload.length || 0,
          category: 'wall'
        }]).select();
        results.push({ status: 'ok', message: 'Замер добавлен: ' + action.payload.wall + ' ' + action.payload.length + ' см' });

      } else if (action.tool === 'add_comm') {
        result = await db.from('room_comms').insert([{
          room_id: action.payload.room_id || 5,
          tenant_id,
          comm_type: action.payload.comm_type,
          wall: action.payload.wall || 'left',
          offset_y: action.payload.offset_y || 0,
          size: action.payload.size || null
        }]).select();
        results.push({ status: 'ok', message: 'Коммуникация добавлена: ' + action.payload.comm_type });

      } else {
        results.push({ status: 'error', message: 'Инструмент ' + action.tool + ' не реализован' });
      }
    } catch (error) {
      results.push({ status: 'error', message: error.message });
    }
  }
  return { status: 'completed', results };
}
