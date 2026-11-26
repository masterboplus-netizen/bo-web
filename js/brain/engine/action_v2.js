import { db } from '../../api/supabase.js';

export async function executeActions(plan, context) {
  const results = [];
  const tenant_id = context.tenant_id || 1;

  for (const action of plan.actions) {
    try {
      if (!action || !action.payload) continue;
      const tool = action.tool;

      if (tool === 'clarify') {
        results.push({ status: 'ok', message: action.payload.question || 'Уточните данные' });
      }
      else if (tool === 'chat') {
        results.push({ status: 'ok', message: action.payload.reply || 'Я вас слушаю!' });
      } 
      else if (tool === 'navigate') {
        const screen = action.payload.screen;
        const navMsg = (msg) => results.push({ status: 'ok', message: msg, is_navigation: true });

        if (screen === 'tasks' && window.openTasks) { window.openTasks(); navMsg('Открываю задачи'); }
        else if (screen === 'objects' && window.openObjects) { window.openObjects(); navMsg('Открываю объекты'); }
        else if (screen === 'finance' && window.openFinance) { window.openFinance(); navMsg('Открываю финансы'); }
        else if (screen === 'diary' && window.openDiary) { window.openDiary(); navMsg('Открываю дневник'); }
        else if (screen === 'calendar' && window.openCalendar) { window.openCalendar(); navMsg('Открываю календарь'); }
        else if (screen === 'photos' && window.openPhotos) { window.openPhotos(); navMsg('Открываю галерею'); }
        else if (screen === 'menu' && window.openMenu) { window.openMenu(); navMsg('Открываю меню'); }
        else { results.push({ status: 'ok', message: 'Пока не умею открывать этот экран' }); }
      }
      else if (tool === 'list_objects') {
        const { data: objects, error } = await db.from('objects').select('name').eq('tenant_id', tenant_id).limit(10);
        if (error) throw error;
        if (!objects || objects.length === 0) {
          results.push({ status: 'ok', message: 'У вас пока нет объектов.' });
        } else {
          const names = objects.map(o => o.name).join(', ');
          results.push({ status: 'ok', message: `Ваши объекты: ${names}` });
        }
      }
      else if (tool === 'add_task') {
        const title = action.payload.title || 'Без названия';
        let object_id = null;

        if (action.payload.object_name) {
          const { data: obj } = await db
            .from('objects')
            .select('id')
            .eq('name', action.payload.object_name)
            .eq('tenant_id', tenant_id)
            .limit(1);
          if (obj && obj.length > 0) object_id = obj[0].id;
        }

        await db.from('tasks').insert([{ 
          title: title, 
          status: 'open', 
          priority: 'medium', 
          tenant_id: tenant_id,
          object_id: object_id
        }]);
        
        results.push({ status: 'ok', message: `Задача создана: ${title}${object_id ? ' (объект: ' + action.payload.object_name + ')' : ''}` });
      } 
      else if (tool === 'add_expense') {
        let object_id = null;
        if (action.payload.object_name) {
          const { data: obj } = await db
            .from('objects')
            .select('id')
            .eq('name', action.payload.object_name)
            .eq('tenant_id', tenant_id)
            .limit(1);
          if (obj && obj.length > 0) object_id = obj[0].id;
        }

        await db.from('finance').insert([{ 
          amount: action.payload.amount || 0, 
          category: action.payload.category || 'Прочее', 
          type: 'expense', 
          date: new Date().toISOString(), 
          tenant_id: tenant_id,
          object_id: object_id
        }]);
        
        results.push({ status: 'ok', message: `Расход добавлен: ${action.payload.amount}` });
      }
      else if (tool === 'create_object') {
        const name = action.payload.name || 'Новый объект';
        await db.from('objects').insert([{ name: name, tenant_id }]);
        results.push({ status: 'ok', message: `Объект создан: ${name}` });
      }
      else {
        results.push({ status: 'error', message: `Инструмент ${tool} пока не подключен` });
      }
    } catch (error) {
      results.push({ status: 'error', message: error.message });
    }
  }

  return { status: 'completed', results };
}
