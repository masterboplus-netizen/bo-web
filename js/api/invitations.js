import { db } from './supabase.js';

// 1. Создать приглашение
export async function createInvitation(objectId, permissions, roleName = 'member') {
    const { data: userData, error: userError } = await db.auth.getUser();
    if (userError || !userData.user) throw new Error('Не авторизован');

    const { data, error } = await db
        .from('invitations')
        .insert({
            object_id: objectId,
            created_by: userData.user.id,
            role_name: roleName,
            can_view_tasks: permissions.can_view_tasks ?? true,
            can_create_tasks: permissions.can_create_tasks ?? false,
            can_view_finance: permissions.can_view_finance ?? false,
            can_view_diary: permissions.can_view_diary ?? true,
            can_view_photos: permissions.can_view_photos ?? true
        })
        .select()
        .single();

    if (error) throw error;
    
    // Возвращаем ссылку для копирования
    return `https://masterbo.work.gd/join/${data.token}`;
}

// 2. Принять приглашение (вызывается после логина)
export async function acceptInvitation(token) {
    const { data: userData, error: userError } = await db.auth.getUser();
    if (userError || !userData.user) throw new Error('Не авторизован');

    // Ищем инвайт
    const { data: invite, error: inviteError } = await db
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

    if (inviteError || !invite) throw new Error('Приглашение не найдено или истекло');
    
    // Проверяем срок
    if (new Date(invite.expires_at) < new Date()) {
        throw new Error('Срок действия приглашения истек');
    }

    // Добавляем пользователя в объект
    const { error: insertError } = await db
        .from('object_members')
        .insert({
            object_id: invite.object_id,
            user_id: userData.user.id,
            role_name: invite.role_name,
            can_view_tasks: invite.can_view_tasks,
            can_create_tasks: invite.can_create_tasks,
            can_view_finance: invite.can_view_finance,
            can_view_diary: invite.can_view_diary,
            can_view_photos: invite.can_view_photos
        });

    // Если уже есть - игнорируем ошибку дубликата (on conflict do nothing в SQL)
    if (insertError && insertError.code !== '23505') throw insertError;

    return invite.object_id;
}
