import { signIn, signUp } from '../api/auth.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: var(--bg); padding: 20px;">
            <div style="background: var(--bg2); padding: 30px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <h2 style="margin: 0 0 20px 0; text-align: center; font-size: 24px; color: var(--fg);">MasterBoss</h2>
                
                <div id="login-error" style="color: #ff4d4f; text-align: center; margin-bottom: 10px; font-size: 14px; display: none;"></div>
                
                <input type="email" id="login-email" placeholder="Email" style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; box-sizing: border-box; outline: none;">
                <input type="password" id="login-password" placeholder="Пароль" style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; box-sizing: border-box; outline: none;">
                <input type="text" id="login-name" placeholder="Ваше имя (при регистрации)" style="width: 100%; padding: 12px 16px; margin-bottom: 20px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg3); color: var(--fg); font-size: 15px; box-sizing: border-box; outline: none; display: none;">
                
                <button id="btn-login" style="width: 100%; padding: 14px; border-radius: 10px; border: none; background: var(--accent); color: white; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">Войти</button>
                <button id="btn-register" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--fg); font-size: 16px; cursor: pointer;">Зарегистрироваться</button>
                
                <div style="text-align: center; margin-top: 15px;">
                    <a href="#" id="link-toggle" style="color: var(--accent); text-decoration: none; font-size: 14px;">Нет аккаунта? Зарегистрируйтесь</a>
                </div>
            </div>
        </div>
    `;

    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const nameInput = document.getElementById('login-name');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const toggleLink = document.getElementById('link-toggle');
    const errorDiv = document.getElementById('login-error');

    let isRegisterMode = false;

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
    }

    toggleLink.onclick = (e) => {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        if (isRegisterMode) {
            nameInput.style.display = 'block';
            btnLogin.style.display = 'none';
            btnRegister.textContent = 'Зарегистрироваться';
            toggleLink.textContent = 'Уже есть аккаунт? Войти';
        } else {
            nameInput.style.display = 'none';
            btnLogin.style.display = 'block';
            toggleLink.textContent = 'Нет аккаунта? Зарегистрируйтесь';
        }
    };

    btnLogin.onclick = async () => {
        try {
            const email = emailInput.value.trim();
            const pass = passInput.value.trim();
            if (!email || !pass) return showError('Заполните все поля');
            await signIn(email, pass);
            window.location.reload();
        } catch (e) {
            showError(e.message);
        }
    };

    btnRegister.onclick = async () => {
        try {
            const email = emailInput.value.trim();
            const pass = passInput.value.trim();
            const name = nameInput.value.trim();
            if (!email || !pass) return showError('Заполните все поля');
            await signUp(email, pass, name || 'Пользователь');
            alert('Регистрация успешна! Теперь войдите.');
            isRegisterMode = false;
            nameInput.style.display = 'none';
            btnLogin.style.display = 'block';
            btnRegister.textContent = 'Зарегистрироваться';
            toggleLink.textContent = 'Нет аккаунта? Зарегистрируйтесь';
        } catch (e) {
            showError(e.message);
        }
    };
}
