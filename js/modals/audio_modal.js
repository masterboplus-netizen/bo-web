export function initAudioButton() {
  const micBtn = document.getElementById('main-mic-btn');
  if (!micBtn) return;

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

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
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        // Визуальный эффект отправки
        micBtn.style.color = '#ffcc00'; // желтый цвет

        try {


          const fd = new FormData();
          fd.append('file', audioBlob, 'audio.webm');
          fd.append('model', 'whisper-large-v3-turbo');
          fd.append('language', 'ru');

          const response = await fetch('https://ruomhtlvyqmaqhqqsfqn.supabase.co/functions/v1/voice-task', {
            method: 'POST',
            body: fd
          });

          if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
          }

          const data = await response.json();
          micBtn.style.color = ''; // вернуть цвет
          showTaskConfirm(data.text);
        } catch (err) {
          console.error(err);
          micBtn.style.color = '';
          alert('Ошибка распознавания: ' + err.message);
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.style.color = '#ff3b30'; // красный цвет во время записи
    } catch (err) {
      alert('Ошибка доступа к микрофону: ' + err.message);
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
    }
  }

  micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); }, { passive: false });
  micBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); }, { passive: false });
  micBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopRecording(); }, { passive: false });
  micBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startRecording(); });
  micBtn.addEventListener('mouseup', () => { stopRecording(); });
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
