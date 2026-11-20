// js/social/brain.js
export async function processTextWithBrain(text) {
    // 1. Пробуем выполнить как команду через MasterBossBrain
    if (window.MasterBossBrain && window.BrainTools) {
        const ctx = { object_id: 1, room_id: 5, user_id: 3, role: 'master' };
        const plan = window.MasterBossBrain.plan(text, ctx);
        
        if (plan.status === 'ok') {
            const results = [];
            for (const intent of plan.plan.intents) {
                if (!intent.payload.room_id && ctx.room_id) {
                    intent.payload.room_id = ctx.room_id;
                }
                try {
                    await window.BrainTools.execute(intent.action, intent.payload);
                    results.push(intent.action);
                } catch (e) {
                    return { status: 'error', message: 'Ошибка выполнения: ' + e.message };
                }
            }
            // Если сработало как команда, возвращаем успех
            return { status: 'ok', message: 'Выполнено действий: ' + results.length };
        }
    }

    // 2. Если не команда или не понял — отдаем в Groq (LLM)
    // Пока Groq не подключен, возвращаем заглушку.
    // Когда ты пришлешь код Groq, мы заменим этот блок на реальный вызов.
    return { 
        status: 'chat', 
        message: 'Я пока не умею поддерживать беседу, но я учусь! Пока я могу только выполнять команды (задачи, замеры, расходы).' 
    };
}
