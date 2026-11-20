// МОДУЛЬ: MASTERBOSS BRAIN (ЕДИНОЕ ЯДРО)
// Работает и в браузере, и в Node.js.
(function(global) {
    'use strict';

    function cleanInput(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    }

    function understand(text) {
        const intents = [];
        const t = text.toLowerCase();

        const measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней|передней|задней)?\s*стены\s+(\d+(?:[.,]\d+)?)(?:\s*(?:см|мм|м))?(?:,?\s*снизу\s+(\d+(?:[.,]\d+)?))?/i);
        if (measureMatch) {
            intents.push({ action: 'add_measure', entity: 'room_measures', payload: { wall: measureMatch[1] || 'left', offset_x: parseFloat(measureMatch[2].replace(',', '.')) || 0, offset_y: parseFloat(measureMatch[3]?.replace(',', '.')) || 0 }, confidence: 0.9 });
        }

        const commMatch = t.match(/(щиток|розетка|выключатель|светильник|счетчик|счётчик)\s*(?:(\d+)\s*[хx]\s*(\d+))?/i);
        if (commMatch) {
            const type = commMatch[1].toLowerCase();
            const size = commMatch[2] && commMatch[3] ? `${commMatch[2]}x${commMatch[3]}` : null;
            intents.push({ action: 'add_comm', entity: 'room_comms', payload: { comm_type: type, size: size, wall: 'left', offset_x: 0, offset_y: 0 }, confidence: 0.85 });
        }

        const taskMatch = t.match(/(?:создай|добавь|надо|нужно)\s*(?:задачу\s*)?(.+)/i);
        if (taskMatch && !measureMatch && !commMatch) {
            intents.push({ action: 'create_task', entity: 'tasks', payload: { title: taskMatch[1].trim(), status: 'todo', priority: 'medium' }, confidence: 0.8 });
        }

        const objectMatch = t.match(/(?:создай|добавь)\s*объект\s+(.+)/i);
        if (objectMatch) {
            intents.push({ action: 'create_object', entity: 'objects', payload: { name: objectMatch[1].trim(), address: '' }, confidence: 0.85 });
        }

        if (intents.length === 0) {
            intents.push({ action: 'unknown', entity: null, payload: { raw: text }, confidence: 0.1 });
        }
        return intents;
    }

    function getContext(context) {
        return { object_id: context?.object_id || null, room_id: context?.room_id || null, user_id: context?.user_id || null, role: context?.role || 'guest' };
    }

    function reason(intents, context) {
        const clarifications = [];
        const errors = [];
        for (const intent of intents) {
            if (intent.action === 'unknown') { errors.push(`Не понял фразу: "${intent.payload.raw}". Уточните.`); continue; }
            if (['add_measure', 'add_comm'].includes(intent.action)) { if (!context.room_id) clarifications.push(`Уточните комнату для "${intent.action}".`); }
        }
        return { clarifications, errors };
    }

    function checkPermission(intents, context) {
        const requiresConfirmation = [];
        const forbidden = [];
        for (const intent of intents) {
            if (['create_task', 'create_object', 'add_measure', 'add_comm'].includes(intent.action)) { if (context.role === 'guest') { requiresConfirmation.push(intent); } }
        }
        return { requiresConfirmation, forbidden };
    }

    function buildPlan(intents, context) {
        return { intents: intents.map(i => ({ action: i.action, entity: i.entity, payload: i.payload, confidence: i.confidence })), context: context };
    }

    function saveToMemory(text, plan) { console.log('[Memory] Фраза:', text); console.log('[Memory] План:', JSON.stringify(plan, null, 2)); }
    function logResult(plan, result) { console.log('[Monitoring] Результат:', result); }

    function plan(text, context = {}) {
        const cleanText = cleanInput(text);
        if (!cleanText) return { error: 'Пустой ввод' };
        const intents = understand(cleanText);
        const ctx = getContext(context);
        const { clarifications, errors } = reason(intents, ctx);
        const { requiresConfirmation, forbidden } = checkPermission(intents, ctx);
        const plan = buildPlan(intents, ctx);
        saveToMemory(cleanText, plan);
        logResult(plan, { clarifications, errors, requiresConfirmation, forbidden });
        return { status: errors.length > 0 ? 'error' : (clarifications.length > 0 ? 'needs_clarification' : 'ok'), plan: plan, clarifications: clarifications, errors: errors, requires_confirmation: requiresConfirmation.length > 0, forbidden: forbidden };
    }

    const MasterBossBrain = { plan };
    if (typeof module !== 'undefined' && module.exports) { module.exports = MasterBossBrain; } else { global.MasterBossBrain = MasterBossBrain; }
})(typeof window !== 'undefined' ? window : global);
