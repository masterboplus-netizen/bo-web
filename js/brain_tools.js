// МОДУЛЬ: BRAIN TOOLS (РУКИ МОЗГА)
// Принимает action + payload, выполняет в Supabase.

const BrainTools = {
    // Замеры
    add_measure: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('room_measures')
            .insert([{
                room_id: payload.room_id,
                category: 'wall',
                wall_pos: payload.wall,
                length: payload.offset_x,
                width: payload.offset_y
            }]);
        if (error) throw error;
        return { status: 'ok', data: data };
    },

    // Коммуникации
    add_comm: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('room_comms')
            .insert([{
                room_id: payload.room_id,
                comm_type: payload.comm_type,
                wall: payload.wall,
                offset_x: payload.offset_x,
                offset_y: payload.offset_y,
                size: payload.size
            }]);
        if (error) throw error;
        return { status: 'ok', data: data };
    },

    // Задачи
    create_task: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('tasks')
            .insert([{
                title: payload.title,
                status: payload.status,
                priority: payload.priority
            }]);
        if (error) throw error;
        return { status: 'ok', data: data };
    },

    // Объекты
    create_object: async function(payload) {
        if (!window.supabase) throw new Error('Supabase не подключён');
        const { data, error } = await window.supabase
            .from('objects')
            .insert([{
                name: payload.name,
                address: payload.address
            }]);
        if (error) throw error;
        return { status: 'ok', data: data };
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
