import { db } from './supabase.js';

export async function createObjectWithOwner(name) {
    // 1. Получаем текущего юзера
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error('Не авторизован');

    // 2. Создаем объект
    const { data: newObj, error: objError } = await db
        .from('objects')
        .insert({ name: name })
        .select()
        .single();
    
    if (objError) throw objError;

    // 3. Сразу делаем юзера владельцем
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
