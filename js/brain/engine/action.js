import { db } from '../api/supabase.js';

export async function executeActions(plan, context) {
  const results = [];

  for (const action of plan.actions) {
    try {
      let result;
      const tenant_id = context.tenant_id || 1;

      if (!action || !action.payload) {
        results.push({ status: 'error', message: 'Пустой интент от мозга' });
        continue;
      }

      if (action.tool === 'chat') {
        results.push({ status: 'ok', message: action.payload.reply || 'Я вас слушаю!' });
        continue;
      }

      if (action.tool === 'add_task') {
        // Проверка, что есть название
        const title = action.payload.title || 'Без названия';
        
        result = await db.from('tasks').insert([{
          title: title,
          status: 'open',
          priority: 'medium',
          tenant_id
        }]).select();
        results.push({ status: 'ok', message: `Задача создана: ${title}` });
      } 
      else if (action.tool === 'add_expense') {
        result = await db.from('finance').insert([{
          amount: action.payload.amount || 0,
          category: action.payload.category || 'Прочее',
          type: 'expense',
          date: new Date().toISOString(),
          tenant_id
        }]).select();
        results.push({ status: 'ok', message: `Расход добавлен: ${action.payload.amount}` });
      }
      else if (action.tool === 'create_object') {
        result = await db.from('objects').insert([{
          name: action.payload.name || 'Новый объект',
          tenant_id
        }]).select();
        results.push({ status: 'ok', message: `Объект создан: ${action.payload.name}` });
      }
      else {
        results.push({ status: 'error', message: `Инструмент ${action.tool} пока не подключен` });
      }
    } catch (error) {
      results.push({ status: 'error', message: error.message });
    }
  }

  return { status: 'completed', results };
}
