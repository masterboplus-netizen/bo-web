import { db } from './supabase.js';

// === ПАПКИ ===
export async function fetchFolders() {
    const { data, error } = await db.from('photo_folders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createFolder(name) {
    const { data, error } = await db.from('photo_folders').insert([{ name }]).select();
    if (error) throw error;
    return data[0];
}

// === АЛЬБОМЫ ===
export async function fetchAlbums(folderId = null) {
    let query = db.from('photo_albums').select('*').order('created_at', { ascending: false });
    if (folderId !== null) {
        query = query.eq('folder_id', folderId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function createAlbum(name, folderId = null) {
    const { data, error } = await db.from('photo_albums').insert([{ name, folder_id: folderId }]).select();
    if (error) throw error;
    return data[0];
}

// === ФОТО В АЛЬБОМЕ ===
export async function fetchAlbumPhotos(albumId) {
    const { data, error } = await db.from('album_photos').select('photo_id, task_photos(*)').eq('album_id', albumId);
    if (error) throw error;
    return (data || []).map(l => l.task_photos).filter(Boolean);
}

export async function addPhotoToAlbum(albumId, photoId) {
    const { error } = await db.from('album_photos').insert([{ album_id: albumId, photo_id: photoId }]);
    if (error) throw error;
}

// === ФОТО В ПАПКЕ ===
export async function fetchFolderPhotos(folderId) {
    const { data, error } = await db.from('folder_photos').select('photo_id, task_photos(*)').eq('folder_id', folderId);
    if (error) throw error;
    return (data || []).map(l => l.task_photos).filter(Boolean);
}

export async function addPhotoToFolder(folderId, photoId) {
    const { error } = await db.from('folder_photos').insert([{ folder_id: folderId, photo_id: photoId }]);
    if (error) throw error;
}

export async function fetchAlbumPreview(albumId) {
    const { data, error } = await db.from('album_photos').select('photo_id, task_photos(photo_url)').eq('album_id', albumId).limit(4);
    if (error) throw error;
    return (data || []).map(l => l.task_photos?.photo_url).filter(Boolean);
}
