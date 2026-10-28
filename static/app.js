document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image');
  const customUploadLabel = document.querySelector('.custom-file-upload');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const cameraPreview = document.getElementById('cameraPreview');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const previewImageBox = document.querySelector('.preview-box img');
  const langButtons = document.querySelectorAll('.lang-btn');
  const dropZone = document.getElementById('dropZone');
  const scanHistoryContainer = document.getElementById('scanHistory');
  const resultPanel = document.querySelector('[data-result="true"]');
  const translations = {
    en: {
      brandName: 'AgriVision',
      heroTitle: 'Healthy crops start with smart diagnosis.',
      heroSubtitle: 'Upload a leaf image or use your live camera to detect early plant stress and disease conditions.',
      plantScan: 'Plant scan',
      analyzeTitle: 'Analyze your crop',
      chooseImage: 'Choose image',
      startCamera: 'Turn on camera',
      stopCamera: 'Stop camera',
      capturePhoto: 'Capture photo',
      analyzeButton: 'Analyze plant',
      preview: 'Preview',
      imageCapture: 'Image capture',
      emptyState: 'Capture a live photo or upload an image to begin analysis.',
      prediction: 'Prediction',
      statusPill: 'AI Soil & Leaf Check',
      recommendation: 'Recommendation'
    },
    te: {
      brandName: 'అగ్రివిజన్',
      heroTitle: 'స్మార్ట్ రోగనిర్ధారణతో ఆరోగ్యకరమైన పంటలు.',
      heroSubtitle: 'ఆకు చిత్రం అప్లోడ్ చేయండి లేదా మీ లైవ్ కెమెరాను ఉపయోగించి మొలకెత్తుతున్న పంట బలహీనతను గుర్తించండి.',
      plantScan: 'పంట స్కాన్',
      analyzeTitle: 'మీ పంటను విశ్లేషించండి',
      chooseImage: 'చిత్రాన్ని ఎంచుకోండి',
      startCamera: 'కెమెరాను ప్రారంభించండి',
      stopCamera: 'కెమెరాను ఆపివేయండి',
      capturePhoto: 'ఫోటో తీసుకోండి',
      analyzeButton: 'పంటను విశ్లేషించండి',
      preview: 'ప్రీవ్యూ',
      imageCapture: 'చిత్ర ప్రదర్శన',
      emptyState: 'విశ్లేషణను ప్రారంభించడానికి లైవ్ ఫోటో తీసుకోండి లేదా చిత్రాన్ని అప్లోడ్ చేయండి.',
      prediction: 'అంచనా',
      statusPill: 'AI మట్టి & ఆకుపచ్చ పరీక్ష',
      recommendation: 'సలహా'
    }
  };

  let currentLang = 'en';
  let stream = null;

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('plantScanHistory') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveHistory(history) {
    localStorage.setItem('plantScanHistory', JSON.stringify(history.slice(0, 5)));
  }

  function renderHistory() {
    if (!scanHistoryContainer) return;

    const history = getHistory();
    if (!history.length) {
      scanHistoryContainer.innerHTML = '<div class="history-empty">No recent scans yet. Upload or capture an image to get started.</div>';
      return;
    }

    scanHistoryContainer.innerHTML = history.map((item) => `
      <div class="history-item">
        ${item.imageUrl ? `<img class="history-thumb" src="${item.imageUrl}" alt="${item.label}" />` : ''}
        <div>
          <h4>${item.label}</h4>
          <div class="history-meta">
            <span>${item.severity}</span>
            <span>${item.healthScore}%</span>
          </div>
          <div class="history-meta">
            <span>${item.date}</span>
            <span>${item.confidence}%</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function addToHistoryFromResult() {
    const panel = document.querySelector('[data-result="true"]');
    if (!panel) return;

    const label = panel.dataset.label || 'Plant scan';
    const confidence = panel.dataset.confidence || '0';
    const severity = panel.dataset.severity || 'Unknown';
    const healthScore = panel.dataset.healthScore || '0';
    const imageUrl = panel.dataset.imageUrl || '';
    const summary = panel.dataset.summary || label;

    const history = getHistory();
    const newEntry = {
      label,
      severity,
      healthScore: Number(healthScore),
      confidence: Number(confidence) * 100,
      date: new Date().toLocaleDateString(),
      imageUrl,
      summary
    };

    const filtered = history.filter((item) => !(item.imageUrl && item.imageUrl === imageUrl && item.label === label));
    filtered.unshift(newEntry);
    saveHistory(filtered);
    renderHistory();
  }

  const updateUploadLabel = () => {
    if (!customUploadLabel) return;
    const fileName = fileInput && fileInput.files && fileInput.files[0]
      ? fileInput.files[0].name
      : translations[currentLang].chooseImage;
    customUploadLabel.textContent = fileName;
  };

  const updateCameraButtonText = () => {
    if (!startCameraBtn) return;
    const key = stream ? 'stopCamera' : 'startCamera';
    startCameraBtn.textContent = translations[currentLang][key];
  };

  const applyTranslations = () => {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      if (translations[currentLang][key]) {
        node.textContent = translations[currentLang][key];
      }
    });
    updateUploadLabel();
    updateCameraButtonText();
    langButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === currentLang);
    });
  };

  const updatePreviewFromFile = (file) => {
    if (!file || !previewImageBox) return;
    const objectUrl = URL.createObjectURL(file);
    previewImageBox.src = objectUrl;
  };

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentLang = button.dataset.lang;
      applyTranslations();
    });
  });

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      updateUploadLabel();
      const selectedFile = fileInput.files && fileInput.files[0];
      if (selectedFile) {
        updatePreviewFromFile(selectedFile);
      }
    });
    updateUploadLabel();
  }

  if (dropZone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (event) => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (!file) return;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      updateUploadLabel();
      updatePreviewFromFile(file);
    });
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
    updateCameraButtonText();
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(currentLang === 'te' ? 'మీ బ్రౌజర్ కెమెరా అనుమతిని సపోర్ట్ చేయదు.' : 'Your browser does not support camera access.');
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
      updateCameraButtonText();
    } catch (error) {
      console.error('Camera access failed:', error);
      alert(currentLang === 'te'
        ? 'కెమెరా యాక్సెస్ నిరోధించబడింది. మీరు మాన్యువల్గా చిత్రాన్ని అప్లోడ్ చేయవచ్చు.'
        : 'Camera access was blocked. You can still upload an image manually.');
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
        updatePreviewFromFile(file);
      }, 'image/png');
    });
  }

  if (resultPanel) {
    addToHistoryFromResult();
  } else {
    renderHistory();
  }

  window.addEventListener('beforeunload', stopCamera);
  applyTranslations();
});
