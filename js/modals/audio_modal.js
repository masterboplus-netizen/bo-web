let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let timerInterval = null;
let recordingTime = 0;
let drawer = null;

export function initAudioButton() {
    const micBtn = document.getElementById('main-mic-btn');
    if (!micBtn) return;

    // Старт записи при нажатии (касании)
    const startHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isRecording) startRecording();
    };

    // Стоп записи при отпускании (или уходе пальца)
    const stopHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRecording) stopRecording();
    };

    micBtn.addEventListener('mousedown', startHandler);
    micBtn.addEventListener('touchstart', startHandler, { passive: false });

    micBtn.addEventListener('mouseup', stopHandler);
    micBtn.addEventListener('mouseleave', stopHandler);
    micBtn.addEventListener('touchend', stopHandler);
    micBtn.addEventListener('touchcancel', stopHandler);
}

async function startRecording() {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingTime = 0;
        
        showDrawer();

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
            hideDrawer();
            clearInterval(timerInterval);
            await processAudio(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        
        timerInterval = setInterval(() => {
            recordingTime++;
            const timeEl = document.getElementById('recording-time');
            if (timeEl) {
                const mins = Math.floor(recordingTime / 60).toString().padStart(2, '0');
                const secs = (recordingTime % 60).toString().padStart(2, '0');
                timeEl.textContent = `${mins}:${secs}`;
            }
        }, 1000);

    } catch (err) {
        console.error('Ошибка доступа к микрофону:', err);
        // Если доступа нет, показываем ошибку, но не ломаем интерфейс
        showToast('Нет доступа к микрофону');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(timerInterval);
    }
}

function showDrawer() {
    if (drawer) return;
    drawer = document.createElement('div');
    drawer.id = 'audio-drawer';
    // Высота 70px, чтобы не перекрывать левый виджет
    drawer.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; height: 70px; background: var(--bg2); border-top: 1px solid var(--bg3); padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; z-index: 100000; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 -4px 20px rgba(0,0,0,0.6); cursor: pointer;';
    
    drawer.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; color: var(--fg); font-family: monospace; letter-spacing: 2px;" id="recording-time">00:00</div>
        <div id="eq-bars" style="display: flex; gap: 3px; align-items: flex-end; height: 20px;">
            ${Array(9).fill(0).map((_, i) => `<div class="eq-bar" style="width: 4px; background: var(--accent); border-radius: 2px; height: 5px; animation: eqAnim 0.4s infinite ease-in-out alternate; animation-delay: ${i * 0.1}s;"></div>`).join('')}
        </div>
    `;

    if (!document.getElementById('eq-style')) {
        const style = document.createElement('style');
        style.id = 'eq-style';
        style.textContent = `
            @keyframes eqAnim {
                0% { height: 5px; }
                100% { height: 18px; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(drawer);
    
    setTimeout(() => drawer.style.transform = 'translateY(0)', 10);
}

function hideDrawer() {
    if (drawer) {
        drawer.style.transform = 'translateY(100%)';
        setTimeout(() => { if (drawer) { drawer.remove(); drawer = null; } }, 300);
    }
}

// Функция для красивого уведомления (тоста)
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; bottom: 200px; left: 50%; transform: translateX(-50%); background: var(--bg2); color: var(--fg); padding: 12px 24px; border-radius: 20px; font-size: 14px; z-index: 100000; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 1px solid var(--border); text-align: center; transition: opacity 0.3s ease; max-width: 80%; white-space: pre-wrap;';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

async function processAudio(audioBlob) {
    try {
        // 1. Отправляем аудио в Groq (Whisper)
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'ru');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${window.GROQ_API_KEY}` },
            body: formData
        });


        const data = await response.json();
        const text = data.text;

            alert('Не удалось распознать речь.');
            return;
        }

        // 2. Отправляем текст в виджет Бо (вместо тостов)
        if (window.openAssistantWithText) {
            window.openAssistantWithText(text);
        } else {
            console.error('Ассистент не загружен');
        }
    } catch (e) {
        console.error('Ошибка обработки аудио:', e);
        alert('Ошибка: ' + e.message);
    }
}
