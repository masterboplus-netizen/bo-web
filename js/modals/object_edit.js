import { db } from '../api/supabase.js';
import { fetchObjects } from '../api/objects.js';
import { renderObjects } from '../screens/objects.js';

window.openObjectEdit = async function(objOrId) {
    let obj = objOrId;
    if (typeof objOrId === 'number' || typeof objOrId === 'string') {
        // Если пришел ID, загружаем объект
        const { data, error } = await db.from('objects').select(`
            *,
            locations (
                *,
                addresses (*)
            )
        `).eq('id', objOrId).single();
        if (error) { alert('Ошибка загрузки объекта: ' + error.message); return; }
        obj = data;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 500px; max-height: 90vh; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 20px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box; overflow-y: auto;';

    modal.innerHTML = `
        <h3 style="color: var(--fg); margin: 0 0 15px 0; font-size: 18px;">${obj ? 'Редактировать объект' : 'Новый объект'}</h3>
        
        

        <div style="margin-bottom: 15px;">
            <input type="text" id="obj-city" value="${obj && obj.locations && obj.locations.addresses ? escapeHtml(obj.locations.addresses.city || '') : ''}" placeholder="Город" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <input type="text" id="obj-street" value="${obj && obj.locations && obj.locations.addresses ? escapeHtml(obj.locations.addresses.street || '') : ''}" placeholder="Улица" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <input type="text" id="obj-house" value="${obj && obj.locations && obj.locations.addresses ? escapeHtml(obj.locations.addresses.house || '') : ''}" placeholder="Дом" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <input type="text" id="obj-building" value="${obj && obj.locations && obj.locations.addresses ? escapeHtml(obj.locations.addresses.building || '') : ''}" placeholder="Корпус" style="width: 100%; padding: 10px; box-sizing: border-box; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
        </div>

        <div style="margin-bottom: 15px;">
            <input type="text" id="obj-entrance" value="${obj && obj.locations ? escapeHtml(obj.locations.entrance || '') : ''}" placeholder="Подъезд" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <input type="text" id="obj-floor" value="${obj && obj.locations ? escapeHtml(obj.locations.floor || '') : ''}" placeholder="Этаж" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <input type="text" id="obj-apartment" value="${obj && obj.locations ? escapeHtml(obj.locations.apartment || '') : ''}" placeholder="Квартира" style="width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 8px; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px;">
            <textarea id="obj-access-notes" value="${obj && obj.locations ? escapeHtml(obj.locations.access_notes || '') : ''}" placeholder="Ключ, код домофона..." style="width: 100%; padding: 10px; box-sizing: border-box; background: var(--bg3); color: var(--fg); border: 1px solid var(--border); border-radius: 8px; height: 60px;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button onclick="window.closeObjectEdit()" style="flex: 1; padding: 12px; background: var(--bg3); color: var(--fg); border: none; border-radius: 10px; font-size: 15px; cursor: pointer;">Отмена</button>
            <button onclick="window.saveObject(${obj ? obj.id : 'null'})" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer;">Сохранить</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);

    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
};

window.saveObject = async function(objId) {
    try {
        const name = (obj && obj.name) ? obj.name : 'Объект';
        const city = document.getElementById('obj-city').value;
        const street = document.getElementById('obj-street').value;
        const house = document.getElementById('obj-house').value;
        const building = document.getElementById('obj-building').value;
        const entrance = document.getElementById('obj-entrance').value;
        const floor = document.getElementById('obj-floor').value;
        const apartment = document.getElementById('obj-apartment').value;
        const accessNotes = document.getElementById('obj-access-notes').value;

        // 1. Создаем адрес
        const { data: addrData, error: addrError } = await db.from('addresses').insert([{ city, street, house, building }]).select().single();
        if (addrError) throw addrError;

        // 2. Создаем локацию
        const { data: locData, error: locError } = await db.from('locations').insert([{ 
            address_id: addrData.id, 
            entrance, floor, apartment, access_notes: accessNotes 
        }]).select().single();
        if (locError) throw locError;

        // 3. Сохраняем объект
        const objData = { name, location_id: locData.id };

        if (objId) {
            const { error } = await db.from('objects').update(objData).eq('id', objId);
            if (error) throw error;
        } else {
            const { error } = await db.from('objects').insert([objData]);
            if (error) throw error;
        }

        document.querySelector('div[style*="z-index: 100000"]').remove();
        if (objId && window.openObject) window.openObject(objId);
        else if (window.openObjects) window.openObjects();
        else if (window.renderObjects) {
             const objects = await fetchObjects();
             renderObjects(objects);
        }

    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

// Хелпер для экранирования
function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}


window.closeObjectEdit = function() {
    const overlay = document.querySelector('div[style*="z-index: 100000"]');
    if (overlay) overlay.remove();
};
