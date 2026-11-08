export function initAudioButton() {
  const micBtn = document.getElementById('main-mic-btn');
  if (!micBtn) return;

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let timerId = null;
  let startTime = 0;

  const sheet = document.createElement('div');
  sheet.id = 'audio-sheet';
  sheet.style.cssText = 'position: fixed; bottom: -300px; left: 0; width: 100%; background: #1e1e1e; border-radius: 24px 24px 0 0; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; gap: 20px; transition: bottom 0.3s ease; z-index: 99999; box-shadow: 0 -10px 40px rgba(0,0,0,0.5);';
  sheet.innerHTML = `
    <div id="audio-timer" style="font-size: 32px; font-weight: bold; color: #fff; font-variant-numeric: tabular-nums;">00:00</div>
    <div id="audio-waves" style="display: flex; gap: 4px; height: 40px; align-items: center; justify-content: center;">
      ${Array(12).fill(0).map(() => `<div class="wave-bar" style="width: 4px; height: 10px; background: #007aff; border-radius: 2px; transition: height 0.1s ease;"></div>`).join('')}
    </div>
    <div id="audio-status" style="color: #888; font-size: 14px;">Говорите...</div>
  `;
  document.body.appendChild(sheet);

  const timerEl = document.getElementById('audio-timer');
  const wavesEl = document.getElementById('audio-waves');
  const statusEl = document.getElementById('audio-status');

  function animateWaves() {
    if (!isRecording) return;
    const bars = wavesEl.children;
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.height = (Math.random() * 30 + 10) + 'px';
    }
    requestAnimationFrame(animateWaves);
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
        if (timerId) { clearInterval(timerId); timerId = null; }
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

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
          
          sheet.style.bottom = '-300px';
          micBtn.style.transform = 'scale(1)';
          micBtn.style.color = 'var(--fg)';
          
          setTimeout(() => {
            showTaskConfirm(data.text);
          }, 300);

        } catch (err) {
          sheet.style.bottom = '-300px';
          micBtn.style.transform = 'scale(1)';
          micBtn.style.color = 'var(--fg)';
          alert('Ошибка распознавания');
        }
      };

      mediaRecorder.start();
      isRecording = true;
      
      micBtn.style.transform = 'scale(1.2)';
      micBtn.style.color = '#007aff';

      sheet.style.bottom = '0';
      timerEl.textContent = '00:00';
      statusEl.textContent = 'Говорите...';

      let seconds = 0;
      timerId = setInterval(() => {
        if (!isRecording) return;
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = m + ':' + s;
      }, 1000);

      animateWaves();
    } catch (err) {
      alert('Нет доступа к микрофону');
    }
  }

  function stopRecording() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
    }
  }

  // ЗАЖАТИЕ (Тач)
  micBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRecording();
  }, { passive: false });

  micBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRecording();
  }, { passive: false });

  micBtn.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    stopRecording();
  }, { passive: false });

  // ЗАЖАТИЕ (Мышь)
  micBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startRecording();
  });

  window.addEventListener('mouseup', () => {
    if (isRecording) stopRecording();
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
