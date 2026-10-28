document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image');
  const customUploadLabel = document.querySelector('.custom-file-upload');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const cameraPreview = document.getElementById('cameraPreview');
  const cameraCanvas = document.getElementById('cameraCanvas');

  let stream = null;

  const updateUploadLabel = () => {
    if (!customUploadLabel) return;
    const fileName = fileInput && fileInput.files && fileInput.files[0]
      ? fileInput.files[0].name
      : 'Choose image';
    customUploadLabel.textContent = fileName;
  };

  if (fileInput) {
    fileInput.addEventListener('change', updateUploadLabel);
    updateUploadLabel();
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (cameraPreview) {
      cameraPreview.srcObject = null;
    }
    if (captureBtn) captureBtn.disabled = true;
    if (startCameraBtn) startCameraBtn.textContent = 'Turn on camera';
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera access.');
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (cameraPreview) {
        cameraPreview.srcObject = stream;
        await cameraPreview.play();
      }

      if (captureBtn) captureBtn.disabled = false;
      if (startCameraBtn) startCameraBtn.textContent = 'Stop camera';
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access was blocked. You can still upload an image manually.');
    }
  };

  if (startCameraBtn) {
    startCameraBtn.addEventListener('click', async () => {
      if (stream) {
        stopCamera();
        return;
      }
      await startCamera();
    });
  }

  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      if (!cameraPreview || !cameraCanvas) return;

      const context = cameraCanvas.getContext('2d');
      const width = cameraPreview.videoWidth || 640;
      const height = cameraPreview.videoHeight || 480;

      cameraCanvas.width = width;
      cameraCanvas.height = height;
      context.drawImage(cameraPreview, 0, 0, width, height);

      cameraCanvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        if (fileInput) {
          fileInput.files = dataTransfer.files;
        }

        updateUploadLabel();

        const previewImage = document.querySelector('.preview-box img');
        if (previewImage) {
          previewImage.src = URL.createObjectURL(blob);
        }
      }, 'image/png');
    });
  }

  window.addEventListener('beforeunload', stopCamera);
});
