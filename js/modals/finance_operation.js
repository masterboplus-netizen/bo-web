import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function openAddFinance(defaultType = 'income') {
    const container = document.getElementById('app-content');

    let objectOptions = '<option value="">Без объекта (личное)</option>';
    try {
        const { data: objects } = await db.from('objects').select('id, name');
        if (objects) {
            objects.forEach(obj => {
                objectOptions += `<option value="${obj.id}">${escapeHtml(obj.name)}</option>`;
            });
        }
    } catch (e) {
        console.error('Ошибка загрузки объектов', e);
    }

    container.innerHTML = `
        <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
            <button onclick="window.openFinance()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 15px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Новая операция</h2>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 4px;">
                    <button onclick="window.setFinanceType('income')" id="fin-btn-income" style="flex: 1; padding: 10px; border-radius: 10px; border: none; background: #34c759; color: white; font-weight: bold; cursor: pointer;">ПРИХОД</button>
                    <button onclick="window.setFinanceType('expense')" id="fin-btn-expense" style="flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">РАСХОД</button>
                </div>

                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Сумма *</label>
                    <input type="number" id="fin-amount" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 18px;" placeholder="0">
                </div>

                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                    <textarea id="fin-desc" rows="2" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;" placeholder="На что потрачено или от кого пришло..."></textarea>
                </div>

                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Объект</label>
                    <select id="fin-object" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box;">
                        ${objectOptions}
                    </select>
                </div>

                <button onclick="window.saveFinance()" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px;">Сохранить</button>
            </div>
        </div>
    `;

    window.setFinanceType(defaultType || 'income');
}

window.setFinanceType = function(type) {
    window._financeType = type;
    const btnIncome = document.getElementById('fin-btn-income');
    const btnExpense = document.getElementById('fin-btn-expense');

    if (type === 'income') {
        btnIncome.style.background = '#34c759'; btnIncome.style.color = 'white';
        btnExpense.style.background = 'transparent'; btnExpense.style.color = 'var(--fg-dim)';
    } else {
        btnIncome.style.background = 'transparent'; btnIncome.style.color = 'var(--fg-dim)';
        btnExpense.style.background = '#ff3b30'; btnExpense.style.color = 'white';
    }
};

window.saveFinance = async function() {
    const amount = document.getElementById('fin-amount').value;
    const desc = document.getElementById('fin-desc').value.trim();
    const objectId = document.getElementById('fin-object').value;

    if (!amount || Number(amount) <= 0) return alert('Введите корректную сумму!');

    try {
        const { error } = await db.from('finance').insert([{
            type: window._financeType,
            amount: Number(amount),
            description: desc || null,
            object_id: objectId ? Number(objectId) : null
        }]);

        if (error) throw error;
        window.openCashFlow();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

window.deleteFinanceInline = function(id) {
    const overlay = document.getElementById('edit-finance-modal');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }

    window.showConfirm('Удалить эту операцию?', async () => {
        try {
            const { error } = await db.from('finance').delete().eq('id', id);
            if (error) throw error;
            window.renderCashFlow();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};

window.openEditFinanceInline = function(id, amount, desc) {
    const oldModal = document.getElementById('edit-finance-modal');
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'edit-finance-modal';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box; opacity: 0; transition: opacity 0.2s ease;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: calc(100% - 32px); max-width: 400px; max-height: 80vh; overflow-y: auto; margin: 0 auto; background: var(--bg2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.8); box-sizing: border-box;';

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: var(--fg); font-size: 16px;">Редактировать операцию</h3>
            <button id="close-edit-fin" style="background: var(--bg3); border: none; color: var(--fg-dim); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Сумма (₽)</label>
            <input type="number" id="edit-fin-amount" value="${amount}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 18px;">
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; color: var(--fg-dim); margin-bottom: 5px; font-size: 13px;">Описание</label>
            <textarea id="edit-fin-desc" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;">${desc}</textarea>
        </div>

        <div style="display: flex; gap: 10px;">
            <button onclick="window.saveFinanceInline(${id})" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">Сохранить</button>
            <button onclick="window.deleteFinanceInline(${id})" style="padding: 14px 20px; background: #ff3b30; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">Удалить</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    function closeModal() {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('close-edit-fin').onclick = closeModal;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
};

window.saveFinanceInline = async function(id) {
    const amount = document.getElementById('edit-fin-amount').value;
    const desc = document.getElementById('edit-fin-desc').value.trim();

    if (!amount || Number(amount) <= 0) return alert('Введите корректную сумму!');

    try {
        const { error } = await db.from('finance').update({
            amount: Number(amount),
            description: desc || null
        }).eq('id', id);

        if (error) throw error;

        const overlay = document.getElementById('edit-finance-modal');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        }

        window.renderCashFlow();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};

window.openAddFinance = openAddFinance;
