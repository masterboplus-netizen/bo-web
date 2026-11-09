import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

export async function renderCashFlow() {
    if (window.setNavActive) window.setNavActive('finance');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка финансов...</div>';

    try {
        const { data: transactions, error } = await db.from('finance').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let totalBalance = 0;
        transactions.forEach(t => {
            if (t.type === 'income') totalBalance += Number(t.amount);
            else if (t.type === 'expense') totalBalance -= Number(t.amount);
        });

        const balanceColor = totalBalance >= 0 ? '#34c759' : '#ff3b30';
        const balanceSign = totalBalance > 0 ? '+' : '';

        let html = `
            <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button onclick="window.openFinance()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; padding: 10px 0; display: flex; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button onclick="window.openAddFinance()" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Добавить
                    </button>
                </div>

                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--bg3); margin-bottom: 20px;">
                    <div style="color: var(--fg-dim); font-size: 13px; margin-bottom: 5px;">ТЕКУЩИЙ БАЛАНС</div>
                    <div style="color: ${balanceColor}; font-size: 32px; font-weight: bold;">${balanceSign}${totalBalance.toLocaleString('ru-RU')} ₽</div>
                </div>

                <div style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); overflow: hidden;">
                    <div style="display: grid; grid-template-columns: 70px 70px 70px 1fr; background: var(--bg3); padding: 12px 8px; font-size: 11px; color: var(--fg-dim); font-weight: bold; text-align: center; border-bottom: 1px solid var(--border);">
                        <div>ПРИХОД</div>
                        <div>РАСХОД</div>
                        <div>ИТОГ</div>
                        <div style="text-align: left; padding-left: 5px;">ОПИСАНИЕ</div>
                    </div>
        `;

        if (!transactions || transactions.length === 0) {
            html += `<div style="text-align: center; padding: 30px; color: var(--fg-dim); font-size: 14px;">Операций пока нет. Нажмите «Добавить».</div>`;
        } else {
            const grouped = {};
            transactions.forEach(t => {
                const dateStr = new Date(t.created_at).toLocaleDateString('ru-RU');
                if (!grouped[dateStr]) grouped[dateStr] = [];
                grouped[dateStr].push(t);
            });

            for (const [date, ops] of Object.entries(grouped)) {
                let dayIncome = 0;
                let dayExpense = 0;
                ops.forEach(op => {
                    if (op.type === 'income') dayIncome += Number(op.amount);
                    else dayExpense += Number(op.amount);
                });
                const dayTotal = dayIncome - dayExpense;
                const dayTotalColor = dayTotal >= 0 ? '#34c759' : '#ff3b30';

                html += `<div style="background: var(--bg3); padding: 8px 10px; font-size: 12px; color: var(--fg); font-weight: bold; text-align: left; border-bottom: 1px solid var(--border);">${date}</div>`;

                ops.forEach(op => {
                    const isIncome = op.type === 'income';
                    const incVal = isIncome ? Number(op.amount).toLocaleString('ru-RU') : '';
                    const expVal = !isIncome ? Number(op.amount).toLocaleString('ru-RU') : '';

                    html += `
                        <div onclick="window.openEditFinanceInline(${op.id}, ${op.amount}, '${escapeHtml(op.description || '')}', '${op.type}')" style="display: grid; grid-template-columns: 70px 70px 70px 1fr; padding: 12px 8px; font-size: 14px; border-bottom: 1px solid var(--bg3); text-align: center; align-items: center; cursor: pointer;">
                            <div style="color: #34c759; font-weight: bold;">${isIncome ? incVal : ''}</div>
                            <div style="color: #ff3b30; font-weight: bold;">${!isIncome ? expVal : ''}</div>
                            <div></div>
                            <div style="text-align: left; color: var(--fg); font-size: 13px; line-height: 1.3; padding-left: 5px;">${escapeHtml(op.description || '')}</div>
                        </div>
                    `;
                });

                html += `
                    <div style="display: grid; grid-template-columns: 70px 70px 70px 1fr; padding: 12px 8px; font-size: 14px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); text-align: center; align-items: center;">
                        <div></div>
                        <div></div>
                        <div style="color: ${dayTotalColor}; font-weight: bold; font-size: 15px;">${dayTotal > 0 ? '+' : ''}${dayTotal.toLocaleString('ru-RU')}</div>
                        <div style="text-align: left; color: var(--fg-dim); font-size: 11px; font-weight: bold; padding-left: 5px;">ИТОГ ЗА ДЕНЬ</div>
                    </div>
                `;
            }
        }

        html += `</div></div>`;
        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Ошибка загрузки: ${err.message}</div>`;
    }
}

window.openCashFlow = function() {
    if (window.saveCurrentScreen) window.saveCurrentScreen('finance_cashflow');
    renderCashFlow();
};

window.renderCashFlow = renderCashFlow;
