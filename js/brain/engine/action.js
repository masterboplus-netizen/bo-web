import { db } from '../api/supabase.js';

export async function executeActions(plan, context) {
  const results = [];

  for (const action of plan.actions) {
    try {
      let result;
      const tenant_id = context.tenant_id || 1;

      if (!action || !action.payload) continue;

      if (action.tool === 'chat') {
        results.push({ status: 'ok', message: action.payload.reply || 'Я вас слушаю!' });
        continue;
      }

      // НАВИГАЦИЯ
      if (action.tool === 'navigate') {
        const screen = action.payload.screen;
        if (screen === 'tasks' && window.openTasks) { window.openTasks(); results.push({ status: 'ok', message: 'Открываю задачи' }); }
        else if (screen === 'objects' && window.openObjects) { window.openObjects(); results.push({ status: 'ok', message: 'Открываю объекты' }); }
        else if (screen === 'finance' && window.openFinance) { window.openFinance(); results.push({ status: 'ok', message: 'Открываю финансы' }); }
        else { results.push({ status: 'ok', message: 'Пока не умею открывать этот экран' }); }
        continue;
      }

      if (action.tool === 'add_task') {
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
