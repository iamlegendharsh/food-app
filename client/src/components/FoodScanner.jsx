import { useState, useRef, useCallback } from 'react';
import API from '../api';

export default function FoodScanner({ onFoodDetected }) {
  const [mode, setMode] = useState('idle');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const reset = useCallback(() => {
    stopStream();
    setMode('idle');
    setImagePreview(null);
    setImageBase64('');
    setMimeType('image/jpeg');
    setResult(null);
    setError('');
    setQuantity(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [stopStream]);

  const compressImage = useCallback((dataUrl, maxWidth = 900, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process image'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = dataUrl;
    });
  }, []);

  const prepareImage = useCallback(async (dataUrl) => {
    const compressedDataUrl = await compressImage(dataUrl);
    const rawBase64 = compressedDataUrl.split(',')[1];

    setImagePreview(compressedDataUrl);
    setImageBase64(rawBase64);
    setMimeType('image/jpeg');
    setQuantity(1);
    setMode('preview');
  }, [compressImage]);

  const openCamera = useCallback(async () => {
    setError('');
    setResult(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      setStream(mediaStream);
      setMode('camera');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setError('Camera access failed. Allow camera permission or upload a photo instead.');
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !video.videoWidth) {
        setError('Camera not ready. Try again.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not capture image.');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      stopStream();
      await prepareImage(dataUrl);
    } catch (err) {
      setError('Failed to capture photo.');
      stopStream();
      setMode('idle');
    }
  }, [stopStream, prepareImage]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file only.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        await prepareImage(event.target.result);
      } catch (err) {
        setError('Failed to process selected image.');
      }
    };

    reader.onerror = () => setError('Could not read selected file.');
    reader.readAsDataURL(file);
  }, [prepareImage]);

  const analyzeFood = useCallback(async () => {
    setMode('loading');
    setError('');

    try {
      const res = await API.post('/ai/scan-food', {
        imageBase64,
        mimeType,
      });

      setResult(res.data);
      setQuantity(1);
      setMode('result');
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Analysis failed';
      setError(msg);
      setMode('preview');
    }
  }, [imageBase64, mimeType]);

  const qtyNumber = Math.max(Number(quantity) || 1, 0.5);

  const finalResult = result
    ? {
        ...result,
        calories: (Number(result.calories) || 0) * qtyNumber,
        protein: (Number(result.protein) || 0) * qtyNumber,
        carbs: (Number(result.carbs) || 0) * qtyNumber,
        fats: (Number(result.fats) || 0) * qtyNumber,
        quantity: qtyNumber,
        unit: 'serving',
      }
    : null;

  const addToDiary = useCallback(() => {
    if (!finalResult || !onFoodDetected) return;
    onFoodDetected(finalResult);
    reset();
  }, [finalResult, onFoodDetected, reset]);

  const s = {
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      marginBottom: '16px',
    },
    title: {
      marginTop: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
    },
    badge: {
      fontSize: '11px',
      background: '#e0e7ff',
      color: '#6366f1',
      padding: '2px 8px',
      borderRadius: '999px',
      fontWeight: '600',
    },
    btn: {
      padding: '10px 16px',
      background: '#6366f1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
    },
    btnGreen: {
      padding: '10px 16px',
      background: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
    },
    btnGray: {
      padding: '10px 16px',
      background: '#e5e7eb',
      color: '#374151',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
    },
    error: {
      background: '#fee2e2',
      color: '#b91c1c',
      padding: '10px 12px',
      borderRadius: '10px',
      marginBottom: '12px',
      fontSize: '13px',
    },
    infoBox: {
      background: '#f9fafb',
      borderRadius: '12px',
      padding: '14px',
      marginTop: '12px',
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid #eef2f7',
      fontSize: '14px',
    },
    qtyInput: {
      width: '90px',
      padding: '6px 10px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '13px',
      outline: 'none',
    },
  };

  const confidenceStyles = {
    high: { background: '#dcfce7', color: '#15803d' },
    medium: { background: '#fef3c7', color: '#b45309' },
    low: { background: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <div style={s.card}>
      <h3 style={s.title}>
        📷 Food Camera Scanner
        <span style={s.badge}>Groq Vision</span>
      </h3>

      <p style={{ marginTop: '-4px', color: '#777', fontSize: '13px' }}>
        Take or upload a food photo to estimate calories and macros.
      </p>

      {error && <div style={s.error}>⚠️ {error}</div>}

      {mode === 'idle' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={s.btn} onClick={openCamera}>📸 Open Camera</button>
          <button
            style={{ ...s.btn, background: '#8b5cf6' }}
            onClick={() => fileInputRef.current?.click()}
          >
            🖼️ Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>
      )}

      {mode === 'camera' && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: '320px',
              objectFit: 'cover',
              borderRadius: '12px',
              background: '#111',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button style={{ ...s.btnGreen, flex: 1 }} onClick={capturePhoto}>📸 Capture</button>
            <button style={s.btnGray} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {mode === 'preview' && imagePreview && (
        <div>
          <img
            src={imagePreview}
            alt="Food preview"
            style={{
              width: '100%',
              maxHeight: '320px',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button style={{ ...s.btn, flex: 1 }} onClick={analyzeFood}>🔍 Analyse Food</button>
            <button style={s.btnGray} onClick={reset}>Retake</button>
          </div>
        </div>
      )}

      {mode === 'loading' && (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 14px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ margin: 0, color: '#4f46e5', fontWeight: '700' }}>Analysing food with Groq...</p>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: '13px' }}>This may take a few seconds</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {mode === 'result' && finalResult && (
        <div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Scanned food"
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: '12px',
              }}
            />
          )}

          <div style={s.infoBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: '16px' }}>🍽️ {result.foodName}</h4>
              <span style={{ ...s.badge, ...(confidenceStyles[result.confidence] || confidenceStyles.medium) }}>
                {result.confidence} confidence
              </span>
            </div>

            <p style={{ margin: '6px 0 10px', fontSize: '13px', color: '#777' }}>
              Estimated portion: {result.estimatedWeight}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
                Quantity:
              </label>

              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={s.qtyInput}
              />

              <span style={{ fontSize: '12px', color: '#888' }}>
                Multiplies calories and macros
              </span>
            </div>

            <div style={s.row}>
              <span>🔥 Calories</span>
              <b>{finalResult.calories.toFixed(0)} kcal</b>
            </div>
            <div style={s.row}>
              <span>🥩 Protein</span>
              <b>{finalResult.protein.toFixed(1)} g</b>
            </div>
            <div style={s.row}>
              <span>🌾 Carbs</span>
              <b>{finalResult.carbs.toFixed(1)} g</b>
            </div>
            <div style={{ ...s.row, borderBottom: 'none' }}>
              <span>🧈 Fats</span>
              <b>{finalResult.fats.toFixed(1)} g</b>
            </div>

            {result.tips && (
              <div
                style={{
                  marginTop: '12px',
                  background: '#eff6ff',
                  color: '#1e40af',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '13px',
                }}
              >
                💡 {result.tips}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button style={{ ...s.btnGreen, flex: 1 }} onClick={addToDiary}>✅ Add to Food Diary</button>
            <button style={s.btnGray} onClick={reset}>Scan Another</button>
          </div>
        </div>
      )}
    </div>
  );
}
