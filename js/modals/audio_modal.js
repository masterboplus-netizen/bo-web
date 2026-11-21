let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let eqElement = null;

export function initAudioButton() {
    const micBtn = document.getElementById('main-mic-btn');
    if (!micBtn) return;

    micBtn.addEventListener('mousedown', startRecording);
    micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); }, { passive: false });

    window.addEventListener('mouseup', () => { if (isRecording) stopRecording(); });
    window.addEventListener('touchend', () => { if (isRecording) stopRecording(); });
}

async function startRecording() {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        showEqualizer();

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
            hideEqualizer();
            await processAudio(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        document.getElementById('main-mic-btn').style.color = 'red';
    } catch (err) {
        console.error('Ошибка доступа к микрофону:', err);
        alert('Нет доступа к микрофону');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById('main-mic-btn').style.color = 'var(--fg)';
    }
}

function showEqualizer() {
    if (eqElement) return;
    eqElement = document.createElement('div');
    eqElement.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; align-items: flex-end; height: 40px; z-index: 100000; background: var(--bg2); padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);';
    
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'eq-bar';
        bar.style.cssText = `width: 6px; background: var(--accent); border-radius: 3px; animation: eqAnim 0.5s infinite ease-in-out alternate; animation-delay: ${i * 0.1}s;`;
        eqElement.appendChild(bar);
    }
    
    if (!document.getElementById('eq-style')) {
        const style = document.createElement('style');
        style.id = 'eq-style';
        style.textContent = `
            @keyframes eqAnim {
                0% { height: 5px; }
                100% { height: 35px; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(eqElement);
}

function hideEqualizer() {
    if (eqElement) {
        eqElement.remove();
        eqElement = null;
    }
}

async function processAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob);

        console.log('Аудио записано, размер:', audioBlob.size);
        showTaskConfirm('Голосовая задача (распознавание в разработке)');
        
    } catch (e) {
        console.error('Ошибка обработки аудио:', e);
    }
}

function showTaskConfirm(text) {
    const confirm = document.createElement('div');
    confirm.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    confirm.innerHTML = `
        <div style="background: var(--bg2); border-radius: 20px; padding: 24px; max-width: 400px; width: 100%; color: var(--fg);">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">Создать задачу?</h3>
            <div style="background: var(--bg3); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 15px; line-height: 1.4;">${text || '(пусто)'}</div>
            <div style="display: flex; gap: 10px;">
                <button id="task-confirm-no" style="flex: 1; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer;">Отмена</button>
                <button id="task-confirm-yes" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer;">Создать</button>
            </div>
        </div>`;
    document.body.appendChild(confirm);
    
    document.getElementById('task-confirm-no').onclick = () => confirm.remove();
    document.getElementById('task-confirm-yes').onclick = async () => {
        confirm.remove();
        if (window.openNewTask) {
            window.openNewTask(text);
        } else {
            console.error('openNewTask не найден');
        }
    };
}
