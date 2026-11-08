import { db } from './supabase.js';

// Все фото (для галереи)
export async function fetchAllPhotos() {
    const { data, error } = await db.from('task_photos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

// Фото конкретной задачи (через photo_links)
export async function fetchPhotosByTask(taskId) {
    const { data, error } = await db
        .from('photo_links')
        .select('photo_id, task_photos(*)')
        .eq('link_type', 'task')
        .eq('link_id', taskId);
    if (error) throw error;
    return (data || []).map(l => l.task_photos).filter(Boolean);
}

// Привязать фото к чему-либо
export async function linkPhoto(photoId, linkType, linkId) {
    const { error } = await db.from('photo_links').insert([{ photo_id: photoId, link_type: linkType, link_id: linkId }]);
    if (error) throw error;
}

// Отвязать фото
export async function unlinkPhoto(photoId, linkType, linkId) {
    const { error } = await db.from('photo_links').delete().eq('photo_id', photoId).eq('link_type', linkType).eq('link_id', linkId);
    if (error) throw error;
}

// Узнать, куда привязано фото
export async function fetchPhotoLinks(photoId) {
    const { data, error } = await db.from('photo_links').select('*').eq('photo_id', photoId);
    if (error) throw error;
    return data || [];
}
