import { db } from '../api/supabase.js';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}


export async function renderFinance() {
    if (window.setNavActive) window.setNavActive('finance');
    const container = document.getElementById('app-content');
    
    // Считаем общий баланс для капсулы
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
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; padding-bottom: 80px;">
            <h2 style="color: var(--fg); margin-bottom: 20px;">Финансы</h2>

            <!-- Капсула баланса -->
            <div style="background: var(--bg2); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--bg3); margin-bottom: 20px;">
                <div style="color: var(--fg-dim); font-size: 13px; margin-bottom: 5px;">ОБЩИЙ БАЛАНС</div>
                <div style="color: ${balanceColor}; font-size: 32px; font-weight: bold;">${balanceSign}${totalBalance.toLocaleString('ru-RU')} ₽</div>
            </div>

            <!-- Список разделов -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div onclick="window.openCashFlow()" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">📒</span>
                        <span style="color: var(--fg); font-size: 16px; font-weight: 500;">Расходы и Доходы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Бюджет объекта', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">🏗️</span>
                        <span style="color: var(--fg); font-size: 16px;">Бюджет объекта</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Сводная смета', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">📋</span>
                        <span style="color: var(--fg); font-size: 16px;">Сводная смета</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Внеплановые работы', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">⚡</span>
                        <span style="color: var(--fg); font-size: 16px;">Внеплановые работы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Кассовый план', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">💰</span>
                        <span style="color: var(--fg); font-size: 16px;">Кассовый план (Cash Flow)</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>

                <div onclick="window.showStub('Личные финансы', 'finance')" style="background: var(--bg2); border-radius: 12px; padding: 15px; border: 1px solid var(--bg3); cursor: pointer; display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">💳</span>
                        <span style="color: var(--fg); font-size: 16px;">Личные финансы</span>
                    </div>
                    <span style="color: var(--fg-dim);">→</span>
                </div>
            </div>
        </div>
    `;
}

window.openCashFlow = function() {
    saveCurrentScreen('finance_cashflow');
    renderCashFlow();
};

export async function renderCashFlow() {
    if (window.setNavActive) window.setNavActive('finance');
    const container = document.getElementById('app-content');
    container.innerHTML = '<div style="text-align: center; margin-top: 50px; color: var(--fg-dim);">Загрузка финансов...</div>';

    try {
        // Получаем все операции
        const { data: transactions, error } = await db.from('finance').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        // Считаем общий баланс
        let totalBalance = 0;
        transactions.forEach(t => {
            if (t.type === 'income') totalBalance += Number(t.amount);
            else if (t.type === 'expense') totalBalance -= Number(t.amount);
        });

        const balanceColor = totalBalance >= 0 ? '#34c759' : '#ff3b30';
        const balanceSign = totalBalance > 0 ? '+' : '';

        // Формируем HTML
        let html = `
            <div style="padding: 15px; max-width: 600px; margin: 0 auto; padding-bottom: 80px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--fg); margin: 0;">Финансы</h2>
                    <button onclick="window.openAddFinance()" style="background: var(--accent); color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Добавить
                    </button>
                </div>

                <!-- Капсула баланса -->
                <div style="background: var(--bg2); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--bg3); margin-bottom: 20px;">
                    <div style="color: var(--fg-dim); font-size: 13px; margin-bottom: 5px;">ТЕКУЩИЙ БАЛАНС</div>
                    <div style="color: ${balanceColor}; font-size: 32px; font-weight: bold;">${balanceSign}${totalBalance.toLocaleString('ru-RU')} ₽</div>
                </div>

                <!-- Таблица -->
                <div style="background: var(--bg2); border-radius: 12px; border: 1px solid var(--bg3); overflow: hidden;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; background: var(--bg3); padding: 10px; font-size: 12px; color: var(--fg-dim); font-weight: bold; text-align: center;">
                        <div>ПРИХОД</div>
                        <div>РАСХОД</div>
                        <div>ИТОГ</div>
                        <div>ОПИСАНИЕ</div>
                    </div>
        `;

        if (!transactions || transactions.length === 0) {
            html += `<div style="text-align: center; padding: 30px; color: var(--fg-dim); font-size: 14px;">Операций пока нет. Нажмите «Добавить».</div>`;
        } else {
            // Группируем по датам
            const grouped = {};
            transactions.forEach(t => {
                const dateStr = new Date(t.created_at).toLocaleDateString('ru-RU');
                if (!grouped[dateStr]) grouped[dateStr] = [];
                grouped[dateStr].push(t);
            });

            // Рендерим каждую дату
            for (const [date, ops] of Object.entries(grouped)) {
                let dayIncome = 0;
                let dayExpense = 0;
                ops.forEach(op => {
                    if (op.type === 'income') dayIncome += Number(op.amount);
                    else dayExpense += Number(op.amount);
                });
                const dayTotal = dayIncome - dayExpense;
                const dayTotalColor = dayTotal >= 0 ? '#34c759' : '#ff3b30';

                // Заголовок дня
                html += `<div style="background: var(--bg3); padding: 8px 10px; font-size: 12px; color: var(--fg); font-weight: bold; text-align: left; border-bottom: 1px solid var(--border);">${date}</div>`;

                // Строки операций
                ops.forEach(op => {
                    const isIncome = op.type === 'income';
                    const incVal = isIncome ? Number(op.amount).toLocaleString('ru-RU') : '';
                    const expVal = !isIncome ? Number(op.amount).toLocaleString('ru-RU') : '';
                    
                    html += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; padding: 10px; font-size: 13px; border-bottom: 1px solid var(--bg3); text-align: center; align-items: center;">
                            <div style="color: #34c759; font-weight: bold;">${incVal}</div>
                            <div style="color: #ff3b30; font-weight: bold;">${expVal}</div>
                            <div></div>
                            <div style="text-align: left; color: var(--fg); font-size: 12px; line-height: 1.3;">${escapeHtml(op.description || '')}</div>
                        </div>
                    `;
                });

                // Итог за день
                html += `
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; padding: 10px; font-size: 13px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); text-align: center; align-items: center;">
                        <div></div>
                        <div></div>
                        <div style="color: ${dayTotalColor}; font-weight: bold; font-size: 14px;">${dayTotal > 0 ? '+' : ''}${dayTotal.toLocaleString('ru-RU')}</div>
                        <div style="text-align: left; color: var(--fg-dim); font-size: 11px; font-weight: bold;">ИТОГ ЗА ДЕНЬ</div>
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

window.openAddFinance = async function() {
    const container = document.getElementById('app-content');
    
    // Загружаем объекты для выпадающего списка
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
            <button onclick="window.openFinance()" style="background: transparent; border: none; color: var(--fg-dim); cursor: pointer; margin-bottom: 15px; font-size: 14px;">← Назад</button>
            <h2 style="color: var(--fg); margin-bottom: 20px;">Новая операция</h2>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Тип -->
                <div style="display: flex; background: var(--bg2); border-radius: 12px; padding: 4px;">
                    <button onclick="window.setFinanceType('income')" id="fin-btn-income" style="flex: 1; padding: 10px; border-radius: 10px; border: none; background: #34c759; color: white; font-weight: bold; cursor: pointer;">ПРИХОД</button>
                    <button onclick="window.setFinanceType('expense')" id="fin-btn-expense" style="flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; color: var(--fg-dim); cursor: pointer;">РАСХОД</button>
                </div>

                <!-- Сумма -->
                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Сумма *</label>
                    <input type="number" id="fin-amount" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; font-size: 18px;" placeholder="0">
                </div>

                <!-- Описание -->
                <div>
                    <label style="display: block; color: var(--fg-dim); margin-bottom: 5px;">Описание</label>
                    <textarea id="fin-desc" rows="2" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg3); background: var(--bg2); color: var(--fg); box-sizing: border-box; resize: vertical;" placeholder="На что потрачено или от кого пришло..."></textarea>
                </div>

                <!-- Объект -->
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

    window._financeType = 'income'; // По умолчанию приход
};

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
        window.openFinance();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};
