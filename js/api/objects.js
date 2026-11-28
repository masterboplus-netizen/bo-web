import { db } from './supabase.js';

// 1. Получение одного объекта
export async function fetchObject(id) {
    const { data, error } = await db.from('objects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

// 2. Получение списка всех объектов
export async function fetchObjects() {
    const { data, error } = await db.from('objects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

// 3. Универсальное обновление
export async function updateObject(id, arg2, arg3, arg4) {
    let updates = {};
    if (arg3 !== undefined || arg4 !== undefined) {
        updates = { name: arg2, address: arg3, budget: (arg4 === '' || isNaN(Number(arg4))) ? 0 : Number(arg4) };
    } else {
        updates = arg2;
    }
    const { data, error } = await db.from('objects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

// 4. Удаление
export async function deleteObject(id) {
    const { error } = await db.from('objects').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// 5. НОВАЯ функция (с владельцем)
export async function createObjectWithOwner(name, address = '', budget = 0) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Не авторизован');

    const safeBudget = (budget === '' || isNaN(Number(budget))) ? 0 : Number(budget);

    const { data: newObj, error: objError } = await db
        .from('objects')
        .insert({ name: name, budget: safeBudget, city: address })
        .select()
        .single();
    
    if (objError) throw objError;

    const { error: memError } = await db
        .from('object_members')
        .insert({
            object_id: newObj.id,
            user_id: user.id,
            role_name: 'owner',
            can_view_tasks: true,
            can_create_tasks: true,
            can_view_finance: true,
            can_view_diary: true,
            can_view_photos: true
        });

    if (memError) throw memError;
    return newObj;
}

// 6. СТАРАЯ функция-обертка (чтобы старые файлы не ругались на createObject)
export async function createObject(name, address, budget) {
    return createObjectWithOwner(name, address, budget);
}
