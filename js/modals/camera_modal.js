import { db } from '../api/supabase.js';

export function openCameraModal() {
  const modal = document.createElement('div');
  modal.id = 'camera-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;';

  modal.innerHTML = `
    <div style="position: relative; width: 100%; max-width: 500px; height: 70vh; background: #000; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
      <video id="camera-stream" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
      <canvas id="camera-canvas" style="display: none;"></canvas>
      <img id="camera-preview" style="display: none; width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0;">
      
      <div id="camera-loading" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); justify-content: center; align-items: center; font-size: 18px;">Загрузка...</div>

      <div style="position: absolute; bottom: 20px; left: 0; width: 100%; display: flex; justify-content: center; gap: 20px; align-items: center;">
        <button id="camera-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 50px; height: 50px; border-radius: 50%; font-size: 24px; cursor: pointer;">✕</button>
        <button id="camera-shoot" style="background: white; border: none; width: 70px; height: 70px; border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px rgba(255,255,255,0.5);"></button>
        <button id="camera-save" style="background: var(--accent); border: none; color: white; padding: 10px 20px; border-radius: 20px; font-size: 16px; cursor: pointer; display: none;">Сохранить</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const video = document.getElementById('camera-stream');
  const canvas = document.getElementById('camera-canvas');
  const preview = document.getElementById('camera-preview');
  const shootBtn = document.getElementById('camera-shoot');
  const saveBtn = document.getElementById('camera-save');
  const closeBtn = document.getElementById('camera-close');
  const loading = document.getElementById('camera-loading');

  let stream = null;
  let photoData = null;

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = stream;
    } catch (err) {
      alert('Ошибка доступа к камере: ' + err.message);
      closeModal();
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach(track => track.stop());
  }

  function closeModal() {
    stopCamera();
    modal.remove();
  }

  shootBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    video.style.display = 'none';
    preview.src = photoData;
    preview.style.display = 'block';
    
    shootBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  });

  // СОХРАНЕНИЕ В SUPABASE STORAGE
  saveBtn.addEventListener('click', async () => {
    if (!photoData) return;
    loading.style.display = 'flex';

    try {
      // Конвертируем Base64 в Blob
      const res = await fetch(photoData);
      const blob = await res.blob();
      
      // Генерируем уникальное имя файла
      const fileName = `photo_${Date.now()}.jpg`;
      
      // Загружаем в бакет 'photos'
      const { data, error } = await db.storage
        .from('photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (error) throw error;

      // Получаем публичную ссылку
      const { data: urlData } = db.storage.from('photos').getPublicUrl(fileName);
      
      console.log('Фото загружено! Ссылка:', urlData.publicUrl);
      
      // Тут потом можно сохранить urlData.publicUrl в таблицу базы данных
      
      alert('Фото успешно загружено в облако!');
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки: ' + err.message);
    } finally {
      loading.style.display = 'none';
    }
  });

  closeBtn.addEventListener('click', closeModal);
  startCamera();
}
