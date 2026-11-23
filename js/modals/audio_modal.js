let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let timerInterval = null;
let recordingTime = 0;
let drawer = null;

export function initAudioButton() {
    const micBtn = document.getElementById('main-mic-btn');
    if (!micBtn) return;

    micBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
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
        alert('Нет доступа к микрофону');
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
    drawer.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; height: 160px; background: var(--bg2); border-top: 1px solid var(--bg3); padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; z-index: 100000; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 -4px 20px rgba(0,0,0,0.6); cursor: pointer;';
    
    drawer.innerHTML = `
        <div style="font-size: 28px; font-weight: bold; color: var(--fg); font-family: monospace; letter-spacing: 2px;" id="recording-time">00:00</span></div>
        <div id="eq-bars" style="display: flex; gap: 6px; align-items: flex-end; height: 50px;">
            ${Array(9).fill(0).map((_, i) => `<div class="eq-bar" style="width: 8px; background: var(--accent); border-radius: 4px; height: 10px; animation: eqAnim 0.4s infinite ease-in-out alternate; animation-delay: ${i * 0.1}s;"></div>`).join('')}
        </div>
        <div style="color: var(--fg-dim); font-size: 13px;">Нажмите в любое место, чтобы остановить</div>
    `;

    if (!document.getElementById('eq-style')) {
        const style = document.createElement('style');
        style.id = 'eq-style';
        style.textContent = `
            @keyframes eqAnim {
                0% { height: 5px; }
                100% { height: 45px; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(drawer);
    
    setTimeout(() => drawer.style.transform = 'translateY(0)', 10);

    drawer.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopRecording();
    };
}

function hideDrawer() {
    if (drawer) {
        drawer.style.transform = 'translateY(100%)';
        setTimeout(() => { if (drawer) { drawer.remove(); drawer = null; } }, 300);
    }
}

async function processAudio(audioBlob) {
    try {
        console.log('Аудио записано, размер:', audioBlob.size);
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Ваш браузер не поддерживает распознавание речи');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            console.log('Распознано:', text);
            
            if (window.MasterBossBrain && window.MasterBossBrain.handle) {
                const result = await window.MasterBossBrain.handle(text, { tenant_id: 1 });
                
                if (result.status === 'error') {
                    alert('Ошибка мозга: ' + (result.errors ? result.errors.join(', ') : 'Неизвестная ошибка'));
                } else if (result.results && result.results.length > 0) {
                    const msg = result.results.map(r => r.status === 'ok' ? '✅ ' + r.message : '⚠️ ' + r.message).join('\n');
                    alert(msg);
                } else {
                    alert('Мозг не вернул действий');
                }
            } else {
                alert('Мозг не загружен');
            }
        };

        recognition.onerror = (event) => {
            console.error('Ошибка распознавания:', event.error);
            alert('Ошибка распознавания: ' + event.error);
        };

        recognition.start();

    } catch (e) {
        console.error('Ошибка обработки аудио:', e);
        alert('Ошибка: ' + e.message);
    }
}
