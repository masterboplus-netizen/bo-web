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
          micBtn.style.color = '';
          showToast('Слишком короткая запись. Говорите чуть дольше.');
          return;
        }

        micBtn.style.color = '#ffcc00'; // Желтый (отправка)

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch('https://ruomhtlvyqmaqhqqsfqn.supabase.co/functions/v1/voice-task', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const err = await response.text();
            if (err.includes('too short')) {
              throw new Error('Слишком короткая запись. Говорите чуть дольше.');
            }
            throw new Error('Ошибка сервера. Попробуйте позже.');
          }

          const data = await response.json();
          micBtn.style.color = ''; // Вернуть цвет
          showTaskConfirm(data.text);
        } catch (err) {
          console.error(err);
          micBtn.style.color = '';
          showToast(err.message);
        }
      };

      mediaRecorder.start();
      isRecording = true;
      startTime = Date.now();
      micBtn.style.color = '#ff3b30'; // Красный (запись)
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

  // Тап для старта/остановки
  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecording) stopRecording();
    else startRecording();
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
