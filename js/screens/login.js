import { signIn, signUp } from '../api/auth.js';
import { db } from '../api/supabase.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 20px; background: var(--bg); box-sizing: border-box;">
            <h2 style="color: var(--fg); margin-bottom: 30px; font-size: 28px; letter-spacing: 1px;">MasterBoss</h2>
            
            <div style="width: 100%; max-width: 400px; background: var(--bg2); padding: 25px; border-radius: 16px; border: 1px solid var(--bg3); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 id="login-title" style="color: var(--fg); margin-top: 0; text-align: center; font-weight: 500;">Вход в систему</h3>
                
                <input id="login-email" type="email" placeholder="Email" style="width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: var(--bg3); color: var(--fg); box-sizing: border-box; font-size: 16px; outline: none;">
                <input id="login-password" type="password" placeholder="Пароль" style="width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: var(--bg3); color: var(--fg); box-sizing: border-box; font-size: 16px; outline: none;">
                
                <div id="login-name-wrapper" style="display: none;">
                    <input id="login-name" type="text" placeholder="Ваше имя" style="width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 10px; border: 1px solid var(--bg3); background: var(--bg3); color: var(--fg); box-sizing: border-box; font-size: 16px; outline: none;">
                </div>

                <div id="login-error" style="color: #ff453a; font-size: 14px; margin-bottom: 15px; text-align: center; display: none; line-height: 1.4;"></div>

                <button id="login-submit" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-bottom: 15px; transition: opacity 0.2s;">Войти</button>
                
                <p style="text-align: center; color: var(--fg-dim); font-size: 14px; margin: 0;">
                    <span id="login-toggle-text">Нет аккаунта?</span> 
                    <a href="#" id="login-toggle-link" style="color: var(--accent); text-decoration: none; font-weight: 500;">Зарегистрироваться</a>
                </p>
            </div>
        </div>
    `;

    let isLoginMode = true;
    const title = document.getElementById('login-title');
    const nameWrapper = document.getElementById('login-name-wrapper');
    const toggleText = document.getElementById('login-toggle-text');
    const toggleLink = document.getElementById('login-toggle-link');
    const submitBtn = document.getElementById('login-submit');
    const errorDiv = document.getElementById('login-error');

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        title.textContent = isLoginMode ? 'Вход в систему' : 'Регистрация';
        nameWrapper.style.display = isLoginMode ? 'none' : 'block';
        toggleText.textContent = isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?';
        toggleLink.textContent = isLoginMode ? 'Зарегистрироваться' : 'Войти';
        submitBtn.textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
        errorDiv.style.display = 'none';
    });

    submitBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const name = document.getElementById('login-name')?.value.trim();

        if (!email || !password) {
            errorDiv.textContent = 'Заполните email и пароль';
            errorDiv.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        errorDiv.style.display = 'none';

        try {
            if (isLoginMode) {
                await signIn(email, password);
            } else {
                await signUp(email, password, name || email.split('@')[0]);
                errorDiv.style.color = '#32d74b';
                errorDiv.innerHTML = '✅ Успешно! Проверьте почту и нажмите «Подтвердить».';
                errorDiv.style.display = 'block';
                setTimeout(() => toggleLink.click(), 2500);
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                return;
            }
            window.location.reload();
        } catch (err) {
            errorDiv.style.color = '#ff453a';
            
            if (err.message === 'Email not confirmed') {
                errorDiv.innerHTML = `📧 Подтвердите почту. Проверьте письмо. <br><a href="#" id="resend-email" style="color: var(--accent); text-decoration: underline; margin-top: 5px; display: inline-block;">Отправить письмо ещё раз</a>`;
                errorDiv.style.display = 'block';
                
                document.getElementById('resend-email')?.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const { error } = await db.auth.resend({ type: 'signup', email });
                    if (error) {
                        errorDiv.innerHTML = '❌ Не удалось отправить: ' + error.message;
                    } else {
                        errorDiv.innerHTML = '✅ Письмо отправлено! Проверьте почту.';
                    }
                });
            } else if (err.message.includes('Invalid login credentials')) {
                errorDiv.textContent = 'Неверный email или пароль';
            } else if (err.message.includes('User already registered')) {
                errorDiv.textContent = 'Этот email уже зарегистрирован. Попробуйте войти.';
            } else if (err.message.includes('Password should be at least')) {
                errorDiv.textContent = 'Пароль должен быть не менее 6 символов';
            } else {
                errorDiv.textContent = err.message || 'Ошибка авторизации';
            }
            errorDiv.style.display = 'block';
        } finally {
            if (isLoginMode) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        }
    });
}
