// js/social/brain.js
// Связка с MasterBossBrain и BrainTools
export async function processTextWithBrain(text) {
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
                    results.push({ action: intent.action, status: 'ok' });
                } catch (e) {
                    results.push({ action: intent.action, status: 'error', error: e.message });
                }
            }
            return { status: 'ok', results };
        } else {
            return { status: 'error', message: plan.errors.join('; ') || 'Не понял фразу' };
        }
    }
    return { status: 'error', message: 'Мозг не подключен' };
}
