function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(40, 40, 40, 0.95); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; z-index: 100000; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: opacity 0.3s;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function initAudioButton() {
  const micBtn = document.getElementById('main-mic-btn');
  if (!micBtn) return;

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let startTime = 0;
  let timerInterval = null;
  let audioContext = null;
  let analyser = null;

  const modal = document.createElement('div');
  modal.id = 'audio-modal';
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; display: none; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.3s;';
  
  modal.innerHTML = `
    <div style="width: 100%; max-width: 320px; background: var(--bg2); border-radius: 24px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div id="audio-timer" style="font-size: 36px; font-weight: bold; font-variant-numeric: tabular-nums; color: var(--accent);">00:00</div>
      
      <div id="level-container" style="width: 100%; height: 40px; background: #1a1a1a; border: 2px solid #333; border-radius: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
        <div style="position: absolute; left: 0; width: 100%; height: 2px; background: rgba(255,255,255,0.1);"></div>
        <div id="level-bubble" style="width: 24px; height: 24px; background: #ffcc00; border-radius: 50%; box-shadow: 0 0 10px rgba(255,204,0,0.5); position: absolute; left: 50%; transform: translateX(-50%); transition: transform 0.1s; z-index: 2;"></div>
        <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.2); z-index: 1;"></div>
      </div>

      <div id="audio-status" style="font-size: 14px; color: var(--fg-dim); min-height: 20px; text-align: center;">Говорите...</div>
      <button id="audio-close" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 56px; height: 56px; border-radius: 50%; font-size: 24px; cursor: pointer; margin-top: 10px;">✕</button>
    </div>
  `;
  document.body.appendChild(modal);

  const timerEl = document.getElementById('audio-timer');
  const bubbleEl = document.getElementById('level-bubble');
  const statusEl = document.getElementById('audio-status');

  function animateBubble() {
    if (!isRecording || !analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const average = sum / dataArray.length;
    
    const offset = Math.min(average * 1.5, 100);
    bubbleEl.style.transform = `translateX(calc(-50% + ${offset}px))`;
    
    requestAnimationFrame(animateBubble);
  }

  function showModal() {
    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);
    timerEl.textContent = '00:00';
    statusEl.textContent = 'Говорите...';
    bubbleEl.style.transform = 'translateX(-50%)';
  }

  function hideModal() {
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  async function startRecording() {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerInterval);
        const duration = Date.now() - startTime;
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        if (duration < 1000) {
          hideModal();
          micBtn.style.color = '';
          showToast('Слишком короткая запись. Говорите чуть дольше.');
          return;
        }

        statusEl.textContent = 'Распознавание...';
        micBtn.style.color = '#ffcc00';

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch('https://ruomhtlvyqmaqhqqsfqn.supabase.co/functions/v1/voice-task', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const err = await response.text();
            if (err.includes('too short')) throw new Error('Слишком короткая запись. Говорите чуть дольше.');
            throw new Error('Ошибка сервера. Попробуйте позже.');
          }

          const data = await response.json();
          micBtn.style.color = '';
          hideModal();
          showTaskConfirm(data.text);
        } catch (err) {
          console.error(err);
          micBtn.style.color = '';
          hideModal();
          showToast(err.message);
        }
      };

      mediaRecorder.start();
      isRecording = true;
      startTime = Date.now();
      micBtn.style.color = '#ff3b30';
      
      showModal();
      
      let seconds = 0;
      timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
      }, 1000);
      
      animateBubble();
    } catch (err) {
      showToast('Нет доступа к микрофону. Разрешите в настройках.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
  }

  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecording) stopRecording();
    else startRecording();
  });

  document.getElementById('audio-close').addEventListener('click', () => {
    if (isRecording) stopRecording();
    hideModal();
  });
}

function showTaskConfirm(text) {
  const confirm = document.createElement('div');
  confirm.id = 'task-confirm';
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
  document.getElementById('task-confirm-yes').onclick = () => {
      console.log('TASK CREATE:', text);
      confirm.remove();
  };
}
