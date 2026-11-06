import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderNotepad() {
    if (window.setNavActive) window.setNavActive('notepad');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка заметок...</div>';

    try {
        const { data: notes, error } = await db.from('notes').select('*').order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });
        if (error) throw error;

        let html = `
            <div style="padding: 15px; max-width: 600px; margin: 0 auto; padding-bottom: 80px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--fg); margin: 0;">Блокнот</h2>
                    <button onclick="window.openNewNote()" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Создать
                    </button>
                </div>
        `;

        if (!notes || notes.length === 0) {
            html += `<div style="text-align: center; color: var(--fg-dim); margin-top: 50px;">Заметок пока нет. Нажмите «Создать», чтобы добавить первую.</div>`;
        } else {
            html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
            notes.forEach(note => {
                const date = new Date(note.updated_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                const preview = note.content ? note.content.substring(0, 80) + (note.content.length > 80 ? '...' : '') : 'Нет текста';
                
                html += `
                    <div onclick="window.openNote(${note.id})" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-weight: bold; font-size: 16px; color: var(--fg); margin-bottom: 5px; padding-right: 30px;">${escapeHtml(note.title)}</div>
                            ${note.is_pinned ? '<span style="position: absolute; top: 15px; right: 15px; color: var(--accent);">📌</span>' : ''}
                        </div>
                        <div style="font-size: 14px; color: var(--fg-dim); line-height: 1.4; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                        <div style="font-size: 11px; color: var(--fg-dim);">${date}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки: ${err.message}</div>`;
    }
}

window.openNewNote = async function() {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Создание...</div>';
    
    try {
        const { data, error } = await db.from('notes').insert([{ title: 'Новая заметка', content: '' }]).select();
        if (error) throw error;
        window.openNote(data[0].id);
    } catch (err) {
        alert('Ошибка создания: ' + err.message);
        window.openNotepad();
    }
};

window.openNote = async function(id) {
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка...</div>';

    try {
        const { data: note, error } = await db.from('notes').select('*').eq('id', id).single();
        if (error) throw error;

        container.innerHTML = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 100px; display: flex; flex-direction: column; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button onclick="window.openNotepad()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; font-size: 14px;">← Назад</button>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.togglePinNote(${note.id}, ${note.is_pinned})" style="background: transparent; border: none; color: ${note.is_pinned ? 'var(--accent)' : 'var(--fg-dim)'}; cursor: pointer; font-size: 20px;">
                            ${note.is_pinned ? '📌' : '📍'}
                        </button>
                        <button onclick="window.deleteNote(${note.id})" style="background: transparent; border: none; color: #ff3b30; cursor: pointer; font-size: 16px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                
                <input type="text" id="note-title" value="${escapeHtml(note.title)}" placeholder="Заголовок" style="width: 100%; background: transparent; border: none; color: var(--fg); font-size: 24px; font-weight: bold; margin-bottom: 15px; outline: none;">
                
                <textarea id="note-content" placeholder="Текст заметки..." style="flex: 1; width: 100%; min-height: 50vh; background: transparent; border: none; color: var(--fg); font-size: 16px; line-height: 1.5; resize: none; outline: none; box-sizing: border-box;">${escapeHtml(note.content || '')}</textarea>
                
                <div id="note-status" style="text-align: center; color: var(--fg-dim); font-size: 12px; margin-top: 10px; opacity: 0; transition: opacity 0.3s;">Сохранено</div>
            </div>
        `;

        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const statusEl = document.getElementById('note-status');
        
        let saveTimeout;

        const saveNote = async () => {
            const newTitle = titleInput.value.trim() || 'Без названия';
            const newContent = contentInput.value;
            
            statusEl.style.opacity = '0';
            
            const { error } = await db.from('notes').update({
                title: newTitle,
                content: newContent,
                updated_at: new Date().toISOString()
            }).eq('id', id);

            if (!error) {
                statusEl.style.opacity = '1';
                setTimeout(() => { statusEl.style.opacity = '0'; }, 2000);
            }
        };

        const debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveNote, 1000);
        };

        titleInput.addEventListener('input', debouncedSave);
        contentInput.addEventListener('input', debouncedSave);

    } catch (err) {
        alert('Ошибка: ' + err.message);
        window.openNotepad();
    }
};

window.togglePinNote = async function(id, currentStatus) {
    try {
        await db.from('notes').update({ is_pinned: !currentStatus }).eq('id', id);
        window.openNote(id); 
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

window.deleteNote = async function(id) {
    if (!confirm('Удалить заметку?')) return;
    try {
        await db.from('notes').delete().eq('id', id);
        window.openNotepad();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};
