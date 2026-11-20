// МОДУЛЬ: BRAIN TOOLS (Универсальные Руки Мозга)
const BrainTools = {
    // Замеры
    add_measure: async function(payload) {
        if (!window.db) throw new Error('Supabase не подключён');
        const { error } = await window.db.from('room_measures').insert([{
            room_id: payload.room_id, tenant_id: 1, category: 'wall',
            wall_pos: payload.wall || 'left', length: payload.offset_x || 0, width: payload.offset_y || 0
        }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Коммуникации
    add_comm: async function(payload) {
        if (!window.db) throw new Error('Supabase не подключён');
        const { error } = await window.db.from('room_comms').insert([{
            room_id: payload.room_id, tenant_id: 1, comm_type: payload.comm_type,
            wall: payload.wall || 'left', offset_x: payload.offset_x || 0, offset_y: payload.offset_y || 0, size: payload.size || null
        }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Задачи
    create_task: async function(payload) {
        if (!window.db) throw new Error('Supabase не подключён');
        const { error } = await window.db.from('tasks').insert([{
            title: payload.title, status: 'todo', description: payload.description || ''
        }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Объекты (используем name, так как address нет в схеме)
    create_object: async function(payload) {
        if (!window.db) throw new Error('Supabase не подключён');
        const { error } = await window.db.from('objects').insert([{
            name: payload.name, city: payload.city || '', tenant_id: 1, created_by: 1
        }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Расходы (Добавлено!)
    add_expense: async function(payload) {
        if (!window.db) throw new Error('Supabase не подключён');
        // Пока пишем в tasks, так как структуру finance мы не видели
        // В будущем заменим на таблицу finance
        const { error } = await window.db.from('tasks').insert([{
            title: 'Расход: ' + (payload.category || 'Без названия') + ' - ' + (payload.amount || 0) + ' руб.',
            status: 'todo'
        }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Дружелюбный ответ (Болталка)
    chat_reply: async function(payload) {
        return { status: "ok", message: payload.text };
    },

    // Универсальный исполнитель
    execute: async function(action, payload) {
        if (this[action]) {
            return await this[action](payload);
        } else {
            throw new Error('Неизвестное действие: ' + action);
        }
    }
};

window.BrainTools = BrainTools;
export { BrainTools };
