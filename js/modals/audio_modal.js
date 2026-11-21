let mediaRecorder;
let audioChunks = [];
let isRecording = false;

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
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
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

async function processAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob);

        // Отправляем в Edge Function voice-task (или brain-parse, если она умеет аудио)
        // Пока просто заглушка для теста
        console.log('Аудио записано, размер:', audioBlob.size);
        
        // Временная заглушка, чтобы показать модалку
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
