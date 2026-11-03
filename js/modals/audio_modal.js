export function initAudioButton() {
  const micBtn = document.getElementById('main-mic-btn');
  if (!micBtn) return;

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let startTime = 0;

  // Создаем окно один раз и вешаем на body
  const modal = document.createElement('div');
  modal.id = 'audio-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 99999; display: none; flex-direction: column; align-items: center; justify-content: center; color: white;';
  modal.innerHTML = `
    <div style="width: 100%; max-width: 320px; background: var(--bg2); border-radius: 24px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
      <div id="audio-timer" style="font-size: 36px; font-weight: bold; color: var(--accent);">00:00</div>
      
      <div id="audio-visualizer" style="width: 100%; height: 60px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <!-- Полоски эквалайзера -->
      </div>

      <div id="audio-status" style="font-size: 14px; color: var(--fg-dim);">Говорите...</div>
      <button id="audio-stop" style="background: #ff3b30; color: white; border: none; padding: 15px 30px; border-radius: 30px; font-size: 16px; cursor: pointer; margin-top: 10px;">Остановить и распознать</button>
    </div>
  `;
  document.body.appendChild(modal);

  const timerEl = document.getElementById('audio-timer');
  const visEl = document.getElementById('audio-visualizer');
  const statusEl = document.getElementById('audio-status');
  const stopBtn = document.getElementById('audio-stop');

  // Создаем полоски
  for (let i = 0; i < 15; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = 'width: 6px; height: 10px; background: var(--accent); border-radius: 3px; transition: height 0.1s ease;';
    visEl.appendChild(bar);
  }

  function animateBars() {
    if (!isRecording) return;
    const bars = visEl.children;
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.height = (Math.random() * 40 + 10) + 'px';
    }
    requestAnimationFrame(animateBars);
  }

  async function startRecording() {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const duration = Date.now() - startTime;
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        if (duration < 1000) {
          hideModal();
          micBtn.style.color = '';
          alert('Слишком короткая запись. Говорите чуть дольше.');
          return;
        }

        statusEl.textContent = 'Распознавание...';
        
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch('https://ruomhtlvyqmaqhqqsfqn.supabase.co/functions/v1/voice-task', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Ошибка сервера');

          const data = await response.json();
          micBtn.style.color = '';
          hideModal();
          showTaskConfirm(data.text);
        } catch (err) {
          hideModal();
          alert('Ошибка распознавания');
        }
      };

      mediaRecorder.start();
      isRecording = true;
      startTime = Date.now();
      micBtn.style.color = '#ff3b30';
      
      // Показываем окно
      modal.style.display = 'flex';
      timerEl.textContent = '00:00';
      
      let seconds = 0;
      setInterval(() => {
        if (!isRecording) return;
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
      }, 1000);
      
      animateBars();
    } catch (err) {
      alert('Нет доступа к микрофону. Разрешите в настройках.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
    }
  }

  function hideModal() {
    modal.style.display = 'none';
  }

  // Клик по нижней кнопке
  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isRecording) startRecording();
  });

  // Клик по кнопке "Остановить" внутри окна
  stopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    stopRecording();
  });
}

function showTaskConfirm(text) {
  const confirm = document.createElement('div');
  confirm.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px;';
  confirm.innerHTML = `
    <div style="background: var(--bg2); border-radius: 20px; padding: 24px; max-width: 400px; width: 100%; color: var(--fg);">
      <h3 style="margin: 0 0 12px 0; font-size: 18px;">Создать задачу?</h3>
      <div style="background: var(--bg3); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 15px; line-height: 1.4;">${text || '(пусто)'}</div>
      <div style="display: flex; gap: 10px;">
        <button onclick="this.closest('div').parentElement.remove()" style="flex: 1; padding: 14px; background: var(--bg3); color: var(--fg); border: none; border-radius: 12px; font-size: 15px; cursor: pointer;">Отмена</button>
        <button onclick="console.log('TASK:', '${text}'); this.closest('div').parentElement.remove()" style="flex: 1; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer;">Создать</button>
      </div>
    </div>`;
  document.body.appendChild(confirm);
}
