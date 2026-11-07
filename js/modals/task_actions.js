import { db } from '../api/supabase.js';

window.openTaskActions = function(id, name) {
    const oldMenu = document.getElementById('task-action-menu');
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'task-action-menu';
    menu.style.cssText = 'position: fixed; top: 100px; right: 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10005; overflow: hidden; min-width: 160px; display: flex; flex-direction: column;';

    menu.innerHTML = `
        <div onclick="window.deleteTask(${id})" style="padding: 14px 16px; color: #ff3b30; font-size: 15px; cursor: pointer;">Удалить</div>
    `;

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest('button[onclick*="openTaskActions"]')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
};

window.deleteTask = async function(id) {
    window.showConfirm('Вы уверены, что хотите удалить задачу?', async () => {
        try {
            const { error } = await db.from('tasks').delete().eq('id', id);
            if (error) throw error;
            window.openTasks();
        } catch (err) {
            alert('Ошибка удаления: ' + err.message);
        }
    });
};
