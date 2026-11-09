import { db } from './supabase.js';

export async function fetchObjects() {
    const { data, error } = await db.from('objects').select(`
        *,
        locations (
            *,
            addresses (*)
        )
    `);
    if (error) throw error;
    return data;
}

export async function createObject(name, locationId) {
    const { data, error } = await db.from('objects').insert([{
        name: name,
        location_id: locationId,
        budget: 0,
        status: 'active'
    }]).select();
    if (error) throw error;
    return data;
}

export async function updateObject(id, name, locationId) {
    const { error } = await db.from('objects').update({
        name: name,
        location_id: locationId
    }).eq('id', id);
    if (error) throw error;
}

export async function deleteObject(id) {
    const { error } = await db.from('objects').delete().eq('id', id);
    if (error) throw error;
}

export async function fetchObject(id) {
    const { data, error } = await db.from('objects').select(`
        *,
        locations (
            *,
            addresses (*)
        )
    `).eq('id', id).single();
    if (error) throw error;
    return data;
}
