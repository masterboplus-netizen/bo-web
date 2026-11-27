import { db } from './supabase.js';

// Регистрация
export async function signUp(email, password, name) {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

// Вход
export async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

// Выход
export async function signOut() {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}

// Получить текущего пользователя (из Auth)
export async function getCurrentUser() {
  const { data: { user }, error } = await db.auth.getUser();
  if (error) return null;
  return user;
}

// Получить профиль (из таблицы profiles) по auth_id
export async function getProfile(authId) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('auth_id', authId)
    .single();
  if (error) return null;
  return data;
}

// Следить за изменением авторизации
export function onAuthStateChange(callback) {
  return db.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
