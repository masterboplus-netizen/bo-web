import { db } from './supabase.js';

// 1. Получение одного объекта
export async function fetchObject(id) {
    const { data, error } = await db.from('objects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

// 2. Обновление объекта
export async function updateObject(id, updates) {
    const { data, error } = await db.from('objects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

// 3. Удаление объекта
export async function deleteObject(id) {
    const { error } = await db.from('objects').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// 4. Создание объекта с автоматическим назначением владельца
export async function createObjectWithOwner(name, address = '', budget = 0) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Не авторизован');

    // Защита: если budget пустой или не число, ставим 0
    const safeBudget = (budget === '' || isNaN(Number(budget))) ? 0 : Number(budget);

    const { data: newObj, error: objError } = await db
        .from('objects')
        .insert({ 
            name: name, 
            budget: safeBudget,
            city: address // Сохраняем адрес в поле city (или как у вас было)
        })
        .select()
        .single();
    
    if (objError) throw objError;

    // Делаем создателя владельцем
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

// 5. Получение списка всех доступных объектов
export async function fetchObjects() {
    const { data, error } = await db.from('objects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}
