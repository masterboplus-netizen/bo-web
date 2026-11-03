export function openAudioModal() {
  const modal = document.createElement('div');
  modal.id = 'audio-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;';

  modal.innerHTML = `
    <div style="position: relative; width: 100%; max-width: 400px; background: var(--bg2); border-radius: 24px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      
      <div id="audio-timer" style="font-size: 36px; font-weight: bold; font-variant-numeric: tabular-nums; color: var(--accent);">00:00</div>
      
      <div id="audio-visualizer" style="width: 100%; height: 60px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <!-- Полоски эквалайзера будут тут -->
      </div>

      <div id="audio-status" style="font-size: 14px; color: var(--fg-dim); min-height: 20px; text-align: center;">Нажмите и говорите</div>

      <div style="display: flex; gap: 20px; align-items: center; margin-top: 16px;">
        <button id="audio-close" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 56px; height: 56px; border-radius: 50%; font-size: 24px; cursor: pointer;">✕</button>
        
        <button id="audio-record" style="background: #ff3b30; border: none; width: 72px; height: 72px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center;">
          <div id="audio-record-icon" style="width: 24px; height: 24px; background: white; border-radius: 50%; transition: all 0.3s ease;"></div>
        </button>
        
        <button id="audio-save" style="background: var(--accent); border: none; color: white; padding: 12px 24px; border-radius: 24px; font-size: 16px; cursor: pointer; display: none;">Сохранить</button>
      </div>
      
      <div id="audio-loading" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); border-radius: 24px; justify-content: center; align-items: center; font-size: 18px; z-index: 10;">Распознавание...</div>
    </div>
  `;

  document.body.appendChild(modal);

  const timerEl = document.getElementById('audio-timer');
  const visEl = document.getElementById('audio-visualizer');
  const recordBtn = document.getElementById('audio-record');
  const recordIcon = document.getElementById('audio-record-icon');
  const saveBtn = document.getElementById('audio-save');
  const closeBtn = document.getElementById('audio-close');
  const loading = document.getElementById('audio-loading');
  const statusEl = document.getElementById('audio-status');

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let timerInterval = null;
  let seconds = 0;
  let audioBlob = null;
  let recognizedText = '';

  // Создаем полоски эквалайзера
  for (let i = 0; i < 15; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = 'width: 6px; height: 10px; background: var(--accent); border-radius: 3px; transition: height 0.1s ease;';
    visEl.appendChild(bar);
  }

  function animateBars() {
    if (!isRecording) return;
    const bars = visEl.children;
    for (let i = 0; i < bars.length; i++) {
      const height = Math.random() * 40 + 10;
      bars[i].style.height = height + 'px';
    }
    requestAnimationFrame(animateBars);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        recordBtn.style.display = 'none';
        loading.style.display = 'flex';
        statusEl.textContent = 'Отправка...';
        stream.getTracks().forEach(track => track.stop());
        
        // Отправляем в Edge Function
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch('https://ruomhtlvyqmaghqqsfqn.supabase.co/functions/v1/voice-task', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await import('../api/supabase.js')).db.supabaseKey}`
            },
            body: formData
          });

          if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
          }

          const data = await response.json();
          recognizedText = data.text;
          statusEl.textContent = 'Распознано: ' + recognizedText;
          saveBtn.style.display = 'block';
        } catch (err) {
          console.error(err);
          statusEl.textContent = 'Ошибка: ' + err.message;
          saveBtn.style.display = 'block'; // Чтобы можно было просто закрыть
        } finally {
          loading.style.display = 'none';
        }
      };

      mediaRecorder.start();
      isRecording = true;
      
      recordIcon.style.borderRadius = '4px';
      recordIcon.style.width = '20px';
      recordIcon.style.height = '20px';
      recordBtn.style.background = '#333';
      
      seconds = 0;
      timerEl.textContent = '00:00';
      timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
      }, 1000);

      animateBars();
    } catch (err) {
      statusEl.textContent = 'Ошибка доступа к микрофону: ' + err.message;
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(timerInterval);
      
      recordIcon.style.borderRadius = '50%';
      recordIcon.style.width = '24px';
      recordIcon.style.height = '24px';
      recordBtn.style.background = '#ff3b30';
      
      const bars = visEl.children;
      for (let i = 0; i < bars.length; i++) bars[i].style.height = '10px';
    }
  }

  

  
  // Запись по удержанию
  recordBtn.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, { passive: false });

  recordBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRecording) stopRecording();
  }, { passive: false });

  recordBtn.addEventListener('touchcancel', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRecording) stopRecording();
  }, { passive: false });

  // Для десктопа (клик мышкой)
  recordBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isRecording) stopRecording();
    else startRecording();
  });

  saveBtn.addEventListener('click', () => {
    // Пока просто выводим текст и закрываем
    alert('Текст: ' + recognizedText);
    closeModal();
  });

  function closeModal() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
    }
    clearInterval(timerInterval);
    modal.remove();
  }

  closeBtn.addEventListener('click', closeModal);
}

window.openAudioModal = openAudioModal;
