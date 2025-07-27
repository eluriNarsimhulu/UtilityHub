import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, Scissors, Eye, EyeOff, Sliders, RotateCcw, Wand2 } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import ProgressBar from '../components/ProgressBar';

interface ProcessedImage {
  original: File;
  processed: string;
  originalUrl: string;
}

const BackgroundRemover: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [featherRadius, setFeatherRadius] = useState(2);
  const [previewMode, setPreviewMode] = useState<'split' | 'toggle'>('split');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalImage(file);
      
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      setProcessedImageUrl('');
      setProgress(0);
      
      // Load image to canvas for processing
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
        }
      }
    };
    img.src = imageUrl;
  };

  const removeBackground = async () => {
    if (!originalImage) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Try AI-powered background removal first
      const formData = new FormData();
      formData.append('image', originalImage);
      formData.append('sensitivity', sensitivity.toString());
      formData.append('featherRadius', featherRadius.toString());

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
        setProgress(100);
      } else {
        // Fallback to client-side processing
        await processImageClientSide();
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      // Fallback to client-side processing
      await processImageClientSide();
    } finally {
      setProcessing(false);
    }
  };

  const processImageClientSide = async () => {
    const canvas = originalCanvasRef.current;
    const processedCanvas = canvasRef.current;
    
    if (!canvas || !processedCanvas) return;

    const ctx = canvas.getContext('2d');
    const processedCtx = processedCanvas.getContext('2d');
    
    if (!ctx || !processedCtx) return;

    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const processedData = processedCtx.createImageData(imageData);
    
    // Simple background removal algorithm
    await removeBackgroundAlgorithm(imageData, processedData);
    
    processedCtx.putImageData(processedData, 0, 0);
    
    processedCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
        setProgress(100);
      }
    });
  };

  const removeBackgroundAlgorithm = async (imageData: ImageData, processedData: ImageData) => {
    const data = imageData.data;
    const processed = processedData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple edge-based background removal
    const threshold = (100 - sensitivity) * 2.55; // Convert to 0-255 range
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Calculate if pixel is likely background (simple heuristic)
      const brightness = (r + g + b) / 3;
      const isBackground = brightness > threshold || 
                          (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30);

      if (isBackground) {
        // Make background transparent
        processed[i] = r;
        processed[i + 1] = g;
        processed[i + 2] = b;
        processed[i + 3] = 0; // Transparent
      } else {
        // Keep foreground
        processed[i] = r;
        processed[i + 1] = g;
        processed[i + 2] = b;
        processed[i + 3] = a;
      }
    }

    // Apply feathering if specified
    if (featherRadius > 0) {
      applyFeathering(processedData, featherRadius);
    }
  };

  const applyFeathering = (imageData: ImageData, radius: number) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const centerIdx = (y * width + x) * 4;
        
        if (tempData[centerIdx + 3] === 0) continue; // Skip transparent pixels
        
        let alphaSum = 0;
        let count = 0;
        
        // Check surrounding pixels
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            alphaSum += tempData[idx + 3];
            count++;
          }
        }
        
        const avgAlpha = alphaSum / count;
        data[centerIdx + 3] = Math.min(data[centerIdx + 3], avgAlpha);
      }
    }
  };

  const downloadProcessed = () => {
    if (!processedImageUrl || !originalImage) return;
    
    const a = document.createElement('a');
    a.href = processedImageUrl;
    const baseName = originalImage.name.split('.').slice(0, -1).join('.');
    a.download = `${baseName}_no_bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetSettings = () => {
    setSensitivity(50);
    setFeatherRadius(2);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Background Remover</h1>
          <p className="text-gray-300">Remove backgrounds from images with AI-powered precision</p>
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
                    <h3 className="text-white font-semibold">Processing Controls</h3>
                    <button
                      onClick={resetSettings}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Reset Settings"
                    >
                      <RotateCcw className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Sensitivity Control */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Sensitivity: {sensitivity}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Higher values remove more background
                    </p>
                  </div>

                  {/* Feather Radius */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Edge Softness: {featherRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={featherRadius}
                      onChange={(e) => setFeatherRadius(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Softens edges for natural blending
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={removeBackground}
                      disabled={processing}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Wand2 className={`h-4 w-4 ${processing ? 'animate-pulse' : ''}`} />
                      <span>{processing ? 'Processing...' : 'Remove Background'}</span>
                    </button>
                    
                    {processedImageUrl && (
                      <>
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
                        </button>

                        <button
                          onClick={downloadProcessed}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-2 px-4 rounded-lg transition-all"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PNG</span>
                        </button>
                      </>
                    )}
                  </div>

                  {processing && (
                    <div className="mt-4">
                      <ProgressBar progress={progress} />
                    </div>
                  )}
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
                  {showComparison && processedImageUrl && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewMode('split')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          previewMode === 'split' 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Split View
                      </button>
                      <button
                        onClick={() => setPreviewMode('toggle')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          previewMode === 'toggle' 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Toggle View
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative bg-gray-800 rounded-lg overflow-hidden min-h-96">
                  {showComparison && processedImageUrl && previewMode === 'split' ? (
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-2">Original</p>
                        <div className="bg-white/5 rounded p-4">
                          <img 
                            src={originalImageUrl} 
                            alt="Original" 
                            className="w-full h-auto max-h-80 object-contain mx-auto"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-2">Background Removed</p>
                        <div className="bg-white/5 rounded p-4 relative">
                          {/* Checkerboard pattern for transparency */}
                          <div className="absolute inset-4 opacity-20" style={{
                            backgroundImage: `
                              linear-gradient(45deg, #666 25%, transparent 25%), 
                              linear-gradient(-45deg, #666 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #666 75%), 
                              linear-gradient(-45deg, transparent 75%, #666 75%)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                          }} />
                          <img 
                            src={processedImageUrl} 
                            alt="Background Removed" 
                            className="w-full h-auto max-h-80 object-contain mx-auto relative z-10"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-300 text-sm mb-2">
                        {processedImageUrl ? 'Background Removed' : 'Original'}
                      </p>
                      <div className="relative">
                        {processedImageUrl && (
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `
                              linear-gradient(45deg, #666 25%, transparent 25%), 
                              linear-gradient(-45deg, #666 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #666 75%), 
                              linear-gradient(-45deg, transparent 75%, #666 75%)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                          }} />
                        )}
                        <img 
                          src={processedImageUrl || originalImageUrl} 
                          alt="Preview" 
                          className="w-full h-auto max-h-96 object-contain mx-auto relative z-10 cursor-pointer"
                          onClick={() => {
                            if (showComparison && previewMode === 'toggle' && processedImageUrl) {
                              const img = document.querySelector('img[alt="Preview"]') as HTMLImageElement;
                              if (img) {
                                img.src = img.src === processedImageUrl ? originalImageUrl : processedImageUrl;
                              }
                            }
                          }}
                        />
                      </div>
                      {showComparison && previewMode === 'toggle' && processedImageUrl && (
                        <p className="text-gray-400 text-xs mt-2">Click image to toggle between original and processed</p>
                      )}
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

export default BackgroundRemover;