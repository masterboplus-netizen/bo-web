import { db } from './supabase.js';

export async function signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

export async function signUp(email, password, name) {
    const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });
    if (error) throw error;
    return data.user;
}

export async function signOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
}

export async function getCurrentUserId() {
    const user = await getCurrentUser();
    return user ? user.id : null;
}

export function onAuthStateChange(callback) {
    return db.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

export async function getProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    return data;
}
