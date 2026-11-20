// МОДУЛЬ: BRAIN TOOLS (РУКИ МОЗГА)
// Адаптирован под реальную структуру таблиц Supabase

const BrainTools = {
    // Замеры
    add_measure: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('room_measures')
            .insert([{
                room_id: payload.room_id,
                tenant_id: 1, // Заглушка, пока нет авторизации
                category: payload.category || 'wall',
                wall_pos: payload.wall || 'left',
                length: payload.offset_x || 0,
                width: payload.offset_y || 0
            }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Коммуникации
    add_comm: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('room_comms')
            .insert([{
                room_id: payload.room_id,
                tenant_id: 1, // Заглушка
                comm_type: payload.comm_type,
                wall: payload.wall || 'left',
                offset_x: payload.offset_x || 0,
                offset_y: payload.offset_y || 0,
                size: payload.size || null
            }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Задачи
    create_task: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('tasks')
            .insert([{
                title: payload.title,
                status: payload.status || 'todo',
                description: payload.description || ''
            }]);
        if (error) throw error;
        return { status: 'ok' };
    },

    // Объекты (используем name вместо address)
    create_object: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('objects')
            .insert([{
                name: payload.name,
                city: payload.address || '', // Используем city для адреса
                tenant_id: 1, // Заглушка
                created_by: 1  // Заглушка
            }]);
        if (error) throw error;
        return { status: 'ok' };
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
