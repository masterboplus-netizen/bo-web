import { db } from '../../api/supabase.js';


// Генерирует варианты написания (кириллица <-> латиница)
function getVisualTwins(str) {
  const map = { 'а':'a','е':'e','о':'o','р':'p','с':'c','у':'y','х':'x','А':'A','Е':'E','О':'O','Р':'P','С':'C','У':'Y','Х':'X' };
  let twin = '';
  for (let i = 0; i < str.length; i++) {
    twin += map[str[i]] || str[i];
  }
  return twin;
}

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

        // Закрываем ассистента перед переходом
        if (window.hideAssistant) window.hideAssistant();

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
      else if (tool === 'delete_object') {
        const name = (action.payload.name || action.payload.object_name || '').trim();
        if (!name) {
          results.push({ status: 'error', message: 'Не указано название объекта для удаления' });
        } else {
          let existing = [];
          // Ищем точное совпадение
          const { data: exactMatch, error: err1 } = await db
            .from('objects')
            .select('id, name')
            .eq('tenant_id', tenant_id)
            .ilike('name', name)
            .limit(1);
          
          if (err1) throw err1;
          existing = exactMatch || [];
          
          // Если не нашли, ищем визуального двойника
          if (existing.length === 0) {
            const twin = getVisualTwins(name);
            if (twin !== name) {
              const { data: twinMatch, error: err2 } = await db
                .from('objects')
                .select('id, name')
                .eq('tenant_id', tenant_id)
                .ilike('name', twin)
                .limit(1);
              if (err2) throw err2;
              existing = twinMatch || [];
            }
          }


          if (existing && existing.length > 0) {
            const obj = existing[0];
            const { error: delErr } = await db.from('objects').delete().eq('id', obj.id);
            if (delErr) throw delErr;
            results.push({ status: 'ok', message: `Объект "${obj.name}" удален.` });
          } else {
            results.push({ status: 'error', message: `Объект "${name}" не найден.` });
          }
        }
      }
      else if (tool === 'create_object') {
        const name = (action.payload.name || 'Новый объект').trim();

        // Проверка дубля (без учёта регистра)
        let existing = [];
        const { data: exactMatch, error: err1 } = await db
          .from('objects')
          .select('id, name')
          .eq('tenant_id', tenant_id)
          .ilike('name', name)
          .limit(1);
        
        if (err1) throw err1;
        existing = exactMatch || [];
        
        if (existing.length === 0) {
          const twin = getVisualTwins(name);
          if (twin !== name) {
            const { data: twinMatch, error: err2 } = await db
              .from('objects')
              .select('id, name')
              .eq('tenant_id', tenant_id)
              .ilike('name', twin)
              .limit(1);
            if (err2) throw err2;
            existing = twinMatch || [];
          }
        }


        if (existing && existing.length > 0) {
          const dup = existing[0].name;
          results.push({
            status: 'ok',
            message: `Объект "${dup}" уже есть. Выбери вариант ниже или напиши другое название.`,
            duplicate: true,
            original_name: dup
          });
        } else {
          const { error: insErr } = await db.from('objects').insert([{ name: name, tenant_id }]);
          if (insErr) throw insErr;
          results.push({ status: 'ok', message: `Объект создан: ${name}` });
        }
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
