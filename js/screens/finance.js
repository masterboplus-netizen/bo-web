import { db } from '../api/supabase.js';

export async function renderFinance() {
    if (window.setNavActive) window.setNavActive('finance');
    const container = document.getElementById('app-content');

    let totalBalance = 0;
    try {
        const { data: transactions } = await db.from('finance').select('amount, type');
        if (transactions) {
            transactions.forEach(t => {
                if (t.type === 'income') totalBalance += Number(t.amount);
                else if (t.type === 'expense') totalBalance -= Number(t.amount);
            });
        }
    } catch (e) {
        console.error('Ошибка при подсчете баланса', e);
    }

    const balanceColor = totalBalance >= 0 ? '#34c759' : '#ff3b30';
    const balanceSign = totalBalance > 0 ? '+' : '';

    container.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 0 15px 80px 15px;">
            <div style="background: var(--bg2); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--bg3); margin-bottom: 20px;">
                <div style="color: var(--fg-dim); font-size: 13px; margin-bottom: 5px;">ОБЩИЙ БАЛАНС</div>
                <div style="color: ${balanceColor}; font-size: 32px; font-weight: bold;">${balanceSign}${totalBalance.toLocaleString('ru-RU')} ₽</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div onclick="window.openCashFlow()" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        <span style="color: var(--fg); font-size: 16px; font-weight: 500;">Расходы и Доходы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Бюджет объекта', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
                        <span style="color: var(--fg); font-size: 16px;">Бюджет объекта</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Сводная смета', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span style="color: var(--fg); font-size: 16px;">Сводная смета</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Внеплановые работы', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        <span style="color: var(--fg); font-size: 16px;">Внеплановые работы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Кассовый план', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        <span style="color: var(--fg); font-size: 16px;">Кассовый план (Cash Flow)</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Личные финансы', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        <span style="color: var(--fg); font-size: 16px;">Личные финансы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>
            </div>
        </div>
    `;
}

window.openFinance = function() {
    if (window.saveCurrentScreen) window.saveCurrentScreen('finance');
    renderFinance();
};

window.renderFinance = renderFinance;
