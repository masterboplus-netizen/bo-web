import { createInvitation } from '../api/invitations.js';

export function renderInviteScreen(container, objectId) {
    container.innerHTML = `
        <div style="padding: 20px; background: var(--bg); min-height: 100vh; color: var(--fg);">
            <h2 style="margin-bottom: 20px;">Пригласить в объект</h2>
            
            <div style="background: var(--bg2); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                <p style="margin-top: 0; color: var(--fg-dim);">Выберите, что сможет делать приглашенный:</p>

                <label style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
                    <input type="checkbox" id="perm-tasks" checked style="width: 20px; height: 20px;"> Видеть задачи
                </label>
                <label style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
                    <input type="checkbox" id="perm-create-tasks" style="width: 20px; height: 20px;"> Создавать задачи
                </label>
                <label style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
                    <input type="checkbox" id="perm-diary" checked style="width: 20px; height: 20px;"> Видеть дневник
                </label>
                <label style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
                    <input type="checkbox" id="perm-photos" checked style="width: 20px; height: 20px;"> Видеть фото
                </label>
                <label style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
                    <input type="checkbox" id="perm-finance" style="width: 20px; height: 20px;"> Видеть финансы
                </label>

                <p style="font-size: 13px; color: var(--fg-dim); margin-top: 20px; margin-bottom: 20px;">
                    * Вы сможете изменить эти права в любой момент в настройках объекта.
                </p>

                <button id="generate-link-btn" style="width: 100%; padding: 15px; background: var(--accent); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    Сгенерировать ссылку
                </button>
            </div>

            <div id="invite-result" style="margin-top: 20px; display: none; background: var(--bg3); padding: 15px; border-radius: 8px; word-break: break-all;">
                <p style="margin-top: 0; font-size: 14px; color: var(--fg-dim);">Ссылка действует 24 часа:</p>
                <p id="invite-link-text" style="font-size: 16px; color: var(--accent); font-weight: bold; margin-bottom: 15px;"></p>
                <button id="copy-link-btn" style="width: 100%; padding: 10px; background: var(--bg); color: var(--fg); border: 1px solid var(--border); border-radius: 6px; cursor: pointer;">Скопировать ссылку</button>
            </div>

            <button onclick="window.history.back()" style="margin-top: 20px; width: 100%; padding: 12px; background: transparent; color: var(--fg); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">Назад</button>
        </div>
    `;

    document.getElementById('generate-link-btn').addEventListener('click', async () => {
        const btn = document.getElementById('generate-link-btn');
        btn.disabled = true;
        btn.textContent = 'Генерация...';

        try {
            const perms = {
                can_view_tasks: document.getElementById('perm-tasks').checked,
                can_create_tasks: document.getElementById('perm-create-tasks').checked,
                can_view_diary: document.getElementById('perm-diary').checked,
                can_view_photos: document.getElementById('perm-photos').checked,
                can_view_finance: document.getElementById('perm-finance').checked,
            };

            const link = await createInvitation(objectId, perms);
            
            document.getElementById('invite-result').style.display = 'block';
            document.getElementById('invite-link-text').textContent = link;
            btn.textContent = 'Ссылка создана!';
            
            document.getElementById('copy-link-btn').onclick = () => {
                navigator.clipboard.writeText(link);
                document.getElementById('copy-link-btn').textContent = 'Скопировано!';
                setTimeout(() => document.getElementById('copy-link-btn').textContent = 'Скопировать ссылку', 2000);
            };

        } catch (err) {
            alert('Ошибка: ' + err.message);
            btn.disabled = false;
            btn.textContent = 'Сгенерировать ссылку';
        }
    });
}
