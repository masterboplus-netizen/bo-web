import { db } from './supabase.js';
export async function fetchObjects() {
    const { data, error } = await db.from('objects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}
export async function fetchObject(id) {
    const { data, error } = await db.from('objects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}
export async function createObject(name, address, budget) {
    const code = 'OBJ-' + Math.random().toString(16).substring(2, 10).toUpperCase();
    const { data, error } = await db.from('objects').insert([{ code: code, name: name, address: address || null, budget: Number(budget) || 0, status: 'active' }]).select();
    if (error) throw error;
    return data[0];
}
export async function updateObject(id, name, address, budget) {
    const { error } = await db.from('objects').update({ name: name, address: address || null, budget: Number(budget) || 0 }).eq('id', id);
    if (error) throw error;
    return true;
}
