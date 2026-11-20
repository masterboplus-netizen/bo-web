// МОДУЛЬ: MASTERBOSS BRAIN (ЕДИНОЕ ЯДРО)
var MasterBossBrain = (function() {
    'use strict';

    function cleanInput(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    }

    function understand(text) {
        var intents = [];
        var t = text.toLowerCase();
        var measureMatch, commMatch, taskMatch, objectMatch;

        measureMatch = t.match(/(?:от\s+)?(левой|правой|верхней|нижней|передней|задней)?\s*стены\s+(\d+(?:[.,]\d+)?)(?:\s*(?:см|мм|м))?(?:,?\s*снизу\s+(\d+(?:[.,]\d+)?))?/i);
        if (measureMatch) {
            intents.push({ action: 'add_measure', entity: 'room_measures', payload: { wall: measureMatch[1] || 'left', offset_x: parseFloat(measureMatch[2].replace(',', '.')) || 0, offset_y: parseFloat(measureMatch[3]?.replace(',', '.')) || 0 }, confidence: 0.9 });
        }

        commMatch = t.match(/(щиток|розетка|выключатель|светильник|счетчик|счётчик)\s*(?:(\d+)\s*[хx]\s*(\d+))?/i);
        if (commMatch) {
            var type = commMatch[1].toLowerCase();
            var size = commMatch[2] && commMatch[3] ? (commMatch[2] + 'x' + commMatch[3]) : null;
            intents.push({ action: 'add_comm', entity: 'room_comms', payload: { comm_type: type, size: size, wall: 'left', offset_x: 0, offset_y: 0 }, confidence: 0.85 });
        }

        taskMatch = t.match(/(?:создай|добавь|надо|нужно)\s*(?:задачу\s*)?(.+)/i);
        if (taskMatch && !measureMatch && !commMatch) {
            intents.push({ action: 'create_task', entity: 'tasks', payload: { title: taskMatch[1].trim(), status: 'todo', priority: 'medium' }, confidence: 0.8 });
        }

        objectMatch = t.match(/(?:создай|добавь)\s*объект\s+(.+)/i);
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
        var clarifications = [];
        var errors = [];
        for (var i = 0; i < intents.length; i++) {
            var intent = intents[i];
            if (intent.action === 'unknown') { errors.push('Не понял фразу: "' + intent.payload.raw + '". Уточните.'); continue; }
            if (intent.action === 'add_measure' || intent.action === 'add_comm') { if (!context.room_id) clarifications.push('Уточните комнату для "' + intent.action + '".'); }
        }
        return { clarifications: clarifications, errors: errors };
    }

    function checkPermission(intents, context) {
        var requiresConfirmation = [];
        var forbidden = [];
        for (var i = 0; i < intents.length; i++) {
            var intent = intents[i];
            if (intent.action === 'create_task' || intent.action === 'create_object' || intent.action === 'add_measure' || intent.action === 'add_comm') { if (context.role === 'guest') { requiresConfirmation.push(intent); } }
        }
        return { requiresConfirmation: requiresConfirmation, forbidden: forbidden };
    }

    function buildPlan(intents, context) {
        var result = [];
        for (var i = 0; i < intents.length; i++) {
            var intent = intents[i];
            result.push({ action: intent.action, entity: intent.entity, payload: intent.payload, confidence: intent.confidence });
        }
        return { intents: result, context: context };
    }

    function saveToMemory(text, plan) { console.log('[Memory] Фраза:', text); console.log('[Memory] План:', JSON.stringify(plan, null, 2)); }
    function logResult(plan, result) { console.log('[Monitoring] Результат:', result); }

    function plan(text, context) {
        if (!context) context = {};
        var cleanText = cleanInput(text);
        if (!cleanText) return { error: 'Пустой ввод' };
        var intents = understand(cleanText);
        var ctx = getContext(context);
        var reasonResult = reason(intents, ctx);
        var clarifications = reasonResult.clarifications;
        var errors = reasonResult.errors;
        var permissionResult = checkPermission(intents, ctx);
        var requiresConfirmation = permissionResult.requiresConfirmation;
        var forbidden = permissionResult.forbidden;
        var plan = buildPlan(intents, ctx);
        saveToMemory(cleanText, plan);
        logResult(plan, { clarifications: clarifications, errors: errors, requiresConfirmation: requiresConfirmation, forbidden: forbidden });
        return { status: errors.length > 0 ? 'error' : (clarifications.length > 0 ? 'needs_clarification' : 'ok'), plan: plan, clarifications: clarifications, errors: errors, requires_confirmation: requiresConfirmation.length > 0, forbidden: forbidden };
    }

    return { plan: plan };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MasterBossBrain;
}
