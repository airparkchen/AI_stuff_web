import { pipeline, env } from '@huggingface/transformers';

// Configure Transformers.js
env.allowLocalModels = false;

// --- State ---
let captioner = null;
let modelReady = false;
let cameraStream = null;
let autoMode = false;
let autoInterval = null;
let isAnalyzing = false;

// --- DOM Elements ---
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('capture-canvas');
const overlay = document.getElementById('camera-overlay');
const btnCamera = document.getElementById('btn-camera');
const btnCapture = document.getElementById('btn-capture');
const btnAuto = document.getElementById('btn-auto');
const resultBox = document.getElementById('result-box');
const promptInput = document.getElementById('prompt-input');
const progressArea = document.getElementById('progress-area');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const modelStatus = document.getElementById('model-status');
const previewArea = document.getElementById('preview-area');
const previewImg = document.getElementById('preview-img');

// --- Model Loading ---
async function loadModel() {
  try {
    progressText.textContent = 'Loading image-to-text model...';

    captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {
      progress_callback: (progress) => {
        if (progress.status === 'download' || progress.status === 'progress') {
          const pct = progress.progress ? Math.round(progress.progress) : 0;
          progressPct.textContent = `${pct}%`;
          progressFill.style.width = `${pct}%`;
          if (progress.file) {
            progressText.textContent = `Downloading: ${progress.file}`;
          }
        } else if (progress.status === 'ready') {
          progressText.textContent = 'Model ready!';
        }
      },
    });

    modelReady = true;
    progressArea.classList.add('hidden');
    statusText.textContent = 'MODEL READY';
    modelStatus.classList.add('ready');
    btnCapture.disabled = !cameraStream;

    console.log('[VLM] Model loaded successfully');
  } catch (err) {
    console.error('[VLM] Model load error:', err);
    progressText.textContent = `Error: ${err.message}`;
    progressPct.textContent = '';
    statusText.textContent = 'MODEL ERROR';
    modelStatus.classList.add('error');
    resultBox.innerHTML = `<p class="placeholder-text" style="color:var(--danger)">Failed to load model. Please try refreshing the page.<br><br>Error: ${err.message}</p>`;
  }
}

// --- Camera ---
async function enableCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    video.srcObject = cameraStream;
    overlay.classList.add('hidden');
    btnCamera.textContent = 'CAMERA ON';
    btnCamera.classList.add('active');
    if (modelReady) {
      btnCapture.disabled = false;
      btnAuto.disabled = false;
    }
  } catch (err) {
    console.error('[VLM] Camera error:', err);
    overlay.querySelector('p').textContent = `Camera error: ${err.message}`;
  }
}

// --- Capture & Analyze ---
const captureCtx = (() => {
  // Reuse the same canvas context to avoid repeated GPU memory allocation
  let ctx = null;
  return () => {
    if (!ctx) ctx = canvas.getContext('2d');
    return ctx;
  };
})();

function captureFrame() {
  if (!video.videoWidth) return null;
  // Only resize canvas if dimensions actually changed
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const ctx = captureCtx();
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.6);
}

async function analyzeFrame() {
  if (!modelReady || !cameraStream) return;
  // Prevent concurrent inference — skip if previous is still running
  if (isAnalyzing) return;
  isAnalyzing = true;

  const imageData = captureFrame();
  if (!imageData) {
    isAnalyzing = false;
    return;
  }

  // Show preview
  previewArea.style.display = 'block';
  previewImg.src = imageData;

  // Show loading state
  resultBox.className = 'result-box loading';
  resultBox.textContent = 'Analyzing image...';
  btnCapture.disabled = true;

  try {
    const result = await captioner(imageData);
    const text = result?.[0]?.generated_text || 'No description generated.';
    resultBox.className = 'result-box';
    resultBox.textContent = text;
  } catch (err) {
    console.error('[VLM] Analysis error:', err);
    resultBox.className = 'result-box error';
    resultBox.textContent = `Analysis failed: ${err.message}`;
  } finally {
    isAnalyzing = false;
    btnCapture.disabled = false;
  }
}

// --- Auto Mode ---
function toggleAutoMode() {
  autoMode = !autoMode;
  if (autoMode) {
    btnAuto.textContent = 'AUTO: ON';
    btnAuto.classList.add('active');
    autoInterval = setInterval(analyzeFrame, 8000);
    analyzeFrame();
  } else {
    btnAuto.textContent = 'AUTO: OFF';
    btnAuto.classList.remove('active');
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  }
}

// --- Preset Prompts ---
document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    promptInput.value = btn.dataset.prompt;
  });
});

// --- Event Listeners ---
btnCamera.addEventListener('click', enableCamera);
overlay.addEventListener('click', enableCamera);
btnCapture.addEventListener('click', analyzeFrame);
btnAuto.addEventListener('click', toggleAutoMode);

// --- Init ---
loadModel();
