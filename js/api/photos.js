import { db } from './supabase.js';

// 1. Все фото (для главной галереи)
export async function fetchAllPhotos() {
    const { data, error } = await db.from('task_photos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

// 2. Фото конкретной сущности (задачи, объекта и т.д.) через универсальную таблицу связей
export async function fetchPhotosByLink(linkType, linkId) {
    const { data, error } = await db
        .from('photo_links')
        .select('photo_id, task_photos(*)')
        .eq('link_type', linkType)
        .eq('link_id', linkId);
    if (error) throw error;
    return (data || []).map(l => l.task_photos).filter(Boolean);
}

// 3. Создать НОВОЕ фото в галерее (без привязки к задаче)
export async function createPhoto(photoUrl, title = null, category = 'none') {
    const { data, error } = await db.from('task_photos').insert([{
        photo_url: photoUrl,
        title: title,
        category: category
    }]).select().single();
    if (error) throw error;
    return data;
}

// 4. Привязать существующее фото к чему угодно (task, object, album)
export async function linkPhoto(photoId, linkType, linkId) {
    const { error } = await db.from('photo_links').insert([{ 
        photo_id: photoId, 
        link_type: linkType, 
        link_id: linkId 
    }]);
    if (error) throw error;
}

// 5. Отвязать фото (удаляет только связь, само фото остается в галерее)
export async function unlinkPhoto(photoId, linkType, linkId) {
    const { error } = await db.from('photo_links')
        .delete()
        .eq('photo_id', photoId)
        .eq('link_type', linkType)
        .eq('link_id', linkId);
    if (error) throw error;
}

// 6. Удалить фото НАВСЕГДА (и все его связи)
export async function deletePhotoPermanently(photoId) {
    await db.from('photo_links').delete().eq('photo_id', photoId);
    await db.from('album_photos').delete().eq('photo_id', photoId);
    await db.from('folder_photos').delete().eq('photo_id', photoId);
    const { error } = await db.from('task_photos').delete().eq('id', photoId);
    if (error) throw error;
}
