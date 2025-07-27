import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, RotateCcw, Redo, Eye, EyeOff, Sliders } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';

interface EnhancementSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  noiseReduction: number;
  gamma: number;
}

interface HistoryState {
  settings: EnhancementSettings;
  timestamp: number;
}

const ImageEnhancer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'toggle'>('split');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Enhancement settings
  const [settings, setSettings] = useState<EnhancementSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    noiseReduction: 0,
    gamma: 1
  });

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleFileUpload = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalImage(file);
      
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      setEnhancedImageUrl('');
      
      // Reset settings and history
      const initialSettings = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpness: 0,
        noiseReduction: 0,
        gamma: 1
      };
      setSettings(initialSettings);
      setHistory([{ settings: initialSettings, timestamp: Date.now() }]);
      setHistoryIndex(0);
      
      // Load image to canvas
      loadImageToCanvas(url);
    }
  }, []);

  const loadImageToCanvas = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = originalCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Apply initial enhancement
          applyEnhancements();
        }
      }
    };
    img.src = imageUrl;
  };

  const applyEnhancements = useCallback(() => {
    if (!originalCanvasRef.current || !canvasRef.current) return;

    const originalCanvas = originalCanvasRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const originalCtx = originalCanvas.getContext('2d');
    
    if (!ctx || !originalCtx) return;

    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;

    // Get original image data
    const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const imageData = ctx.createImageData(originalImageData);
    const data = imageData.data;
    const originalData = originalImageData.data;

    // Apply enhancements pixel by pixel
    for (let i = 0; i < data.length; i += 4) {
      let r = originalData[i];
      let g = originalData[i + 1];
      let b = originalData[i + 2];
      const a = originalData[i + 3];

      // Apply brightness
      r += settings.brightness * 2.55;
      g += settings.brightness * 2.55;
      b += settings.brightness * 2.55;

      // Apply contrast
      const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // Apply gamma correction
      r = 255 * Math.pow(r / 255, 1 / settings.gamma);
      g = 255 * Math.pow(g / 255, 1 / settings.gamma);
      b = 255 * Math.pow(b / 255, 1 / settings.gamma);

      // Apply saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const saturationFactor = settings.saturation / 100;
      r = gray + saturationFactor * (r - gray);
      g = gray + saturationFactor * (g - gray);
      b = gray + saturationFactor * (b - gray);

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
      data[i + 3] = a;
    }

    // Apply sharpening if needed
    if (settings.sharpness > 0) {
      applySharpening(imageData, settings.sharpness);
    }

    // Apply noise reduction if needed
    if (settings.noiseReduction > 0) {
      applyNoiseReduction(imageData, settings.noiseReduction);
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Update enhanced image URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setEnhancedImageUrl(url);
      }
    });
  }, [settings]);

  const applySharpening = (imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const factor = intensity / 100;
    
    // Simple sharpening kernel
    const kernel = [
      0, -factor, 0,
      -factor, 1 + 4 * factor, -factor,
      0, -factor, 0
    ];

    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += tempData[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }
  };

  const applyNoiseReduction = (imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = Math.ceil(intensity / 20);
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let count = 0;
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c;
              sum += tempData[idx];
              count++;
            }
          }
          
          const idx = (y * width + x) * 4 + c;
          data[idx] = sum / count;
        }
      }
    }
  };

  useEffect(() => {
    if (originalImage) {
      applyEnhancements();
    }
  }, [settings, applyEnhancements, originalImage]);

  const updateSetting = (key: keyof EnhancementSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Add to history
    const newHistoryState = { settings: newSettings, timestamp: Date.now() };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSettings(history[newIndex].settings);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSettings(history[newIndex].settings);
    }
  };

  const resetSettings = () => {
    const initialSettings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      noiseReduction: 0,
      gamma: 1
    };
    setSettings(initialSettings);
    
    const newHistoryState = { settings: initialSettings, timestamp: Date.now() };
    const newHistory = [...history, newHistoryState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const downloadEnhanced = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob && originalImage) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced_${originalImage.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Image Enhancer</h1>
          <p className="text-gray-300">Enhance your images with professional-grade adjustments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload and Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-6">
              {!originalImage ? (
                <FileUploadZone
                  onFilesUploaded={handleFileUpload}
                  acceptedTypes={['image/*']}
                  maxFiles={1}
                  icon={Upload}
                  title="Upload Image"
                  subtitle="JPG, PNG, GIF • Max 1 file"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Enhancement Controls</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Undo"
                      >
                        <RotateCcw className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Redo"
                      >
                        <Redo className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Enhancement Sliders */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Brightness: {settings.brightness}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={settings.brightness}
                        onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Contrast: {settings.contrast}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={settings.contrast}
                        onChange={(e) => updateSetting('contrast', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Saturation: {settings.saturation}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="200"
                        value={settings.saturation}
                        onChange={(e) => updateSetting('saturation', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Sharpness: {settings.sharpness}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.sharpness}
                        onChange={(e) => updateSetting('sharpness', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Noise Reduction: {settings.noiseReduction}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.noiseReduction}
                        onChange={(e) => updateSetting('noiseReduction', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Gamma: {settings.gamma.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={settings.gamma}
                        onChange={(e) => updateSetting('gamma', Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={resetSettings}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Reset All
                    </button>
                    
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
                    </button>

                    <button
                      onClick={downloadEnhanced}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-2 px-4 rounded-lg transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Enhanced</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Preview */}
          <div className="lg:col-span-2">
            {originalImage && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Preview</h3>
                  {showComparison && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewMode('split')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          previewMode === 'split' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Split View
                      </button>
                      <button
                        onClick={() => setPreviewMode('toggle')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          previewMode === 'toggle' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Toggle View
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  {showComparison && previewMode === 'split' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-2">Original</p>
                        <img 
                          src={originalImageUrl} 
                          alt="Original" 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-2">Enhanced</p>
                        <img 
                          src={enhancedImageUrl || originalImageUrl} 
                          alt="Enhanced" 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-300 text-sm mb-2">
                        {showComparison ? 'Enhanced (Click to toggle)' : 'Enhanced'}
                      </p>
                      <img 
                        src={enhancedImageUrl || originalImageUrl} 
                        alt="Enhanced" 
                        className="w-full h-auto max-h-96 object-contain cursor-pointer"
                        onClick={() => {
                          if (showComparison && previewMode === 'toggle') {
                            // Toggle between original and enhanced
                            const img = document.querySelector('img[alt="Enhanced"]') as HTMLImageElement;
                            if (img) {
                              img.src = img.src === enhancedImageUrl ? originalImageUrl : enhancedImageUrl;
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Hidden canvases for processing */}
                <canvas ref={originalCanvasRef} style={{ display: 'none' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ImageEnhancer;