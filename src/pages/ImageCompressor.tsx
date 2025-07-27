// import React, { useState, useCallback } from 'react';
// import { Upload, Download, Image as ImageIcon, Sliders } from 'lucide-react';
// import FileUploadZone from '../components/FileUploadZone';
// import ProgressBar from '../components/ProgressBar';

// interface CompressedImage {
//   original: File;
//   compressed: Blob;
//   originalSize: number;
//   compressedSize: number;
//   savings: number;
// }

// const ImageCompressor: React.FC = () => {
//   const [images, setImages] = useState<File[]>([]);
//   const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
//   const [quality, setQuality] = useState(80);
//   const [processing, setProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFileUpload = useCallback((files: File[]) => {
//     const imageFiles = files.filter(file => file.type.startsWith('image/'));
//     setImages(imageFiles);
//     setCompressedImages([]);
//   }, []);

//   const compressImages = async () => {
//     if (images.length === 0) return;

//     setProcessing(true);
//     setProgress(0);
//     const compressed: CompressedImage[] = [];

//     for (let i = 0; i < images.length; i++) {
//       const file = images[i];
      
//       try {
//         const formData = new FormData();
//         formData.append('image', file);
//         formData.append('quality', quality.toString());

//         const response = await fetch('/api/compress-image', {
//           method: 'POST',
//           body: formData,
//         });

//         if (response.ok) {
//           const blob = await response.blob();
//           const savings = Math.round(((file.size - blob.size) / file.size) * 100);
          
//           compressed.push({
//             original: file,
//             compressed: blob,
//             originalSize: file.size,
//             compressedSize: blob.size,
//             savings,
//           });
//         }
//       } catch (error) {
//         console.error('Compression failed:', error);
//       }

//       setProgress(Math.round(((i + 1) / images.length) * 100));
//     }

//     setCompressedImages(compressed);
//     setProcessing(false);
//   };

//   const downloadImage = (compressedImage: CompressedImage, index: number) => {
//     const url = URL.createObjectURL(compressedImage.compressed);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `compressed_${compressedImage.original.name}`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
//             <ImageIcon className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Image Compressor</h1>
//           <p className="text-gray-300">Reduce image file sizes while maintaining quality</p>
//         </div>

//         <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
//           <FileUploadZone
//             onFilesUploaded={handleFileUpload}
//             acceptedTypes={['image/*']}
//             maxFiles={10}
//             icon={Upload}
//             title="Drop images here or click to browse"
//             subtitle="Supports JPG, PNG, GIF, WebP • Max 10 files"
//           />

//           {images.length > 0 && (
//             <div className="mt-8">
//               <div className="flex items-center space-x-4 mb-6">
//                 <div className="flex items-center space-x-2">
//                   <Sliders className="h-5 w-5 text-gray-400" />
//                   <label className="text-white font-medium">Quality: {quality}%</label>
//                 </div>
//                 <input
//                   type="range"
//                   min="10"
//                   max="100"
//                   value={quality}
//                   onChange={(e) => setQuality(Number(e.target.value))}
//                   className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
//                 />
//               </div>

//               <button
//                 onClick={compressImages}
//                 disabled={processing}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {processing ? 'Compressing...' : `Compress ${images.length} Image${images.length > 1 ? 's' : ''}`}
//               </button>

//               {processing && (
//                 <div className="mt-4">
//                   <ProgressBar progress={progress} />
//                 </div>
//               )}
//             </div>
//           )}

//           {compressedImages.length > 0 && (
//             <div className="mt-8">
//               <h3 className="text-xl font-bold text-white mb-4">Compressed Images</h3>
//               <div className="space-y-4">
//                 {compressedImages.map((img, index) => (
//                   <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
//                     <div>
//                       <p className="text-white font-medium">{img.original.name}</p>
//                       <p className="text-gray-400 text-sm">
//                         {formatFileSize(img.originalSize)} → {formatFileSize(img.compressedSize)} 
//                         <span className="text-green-400 ml-2">({img.savings}% smaller)</span>
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => downloadImage(img, index)}
//                       className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
//                     >
//                       <Download className="h-4 w-4" />
//                       <span>Download</span>
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// };

// export default ImageCompressor;



import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Sliders, Maximize, FileText, XCircle } from 'lucide-react';
import BASE_URL from '../config';

// Mock FileUploadZone and ProgressBar components for demonstration.
// In a real application, these would be imported from their respective files.

interface FileUploadZoneProps {
  onFilesUploaded: (files: File[]) => void;
  acceptedTypes: string[];
  maxFiles: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesUploaded, acceptedTypes, maxFiles, icon: Icon, title, subtitle }) => {
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files).filter(file =>
      acceptedTypes.some(type => file.type.startsWith(type.replace('*', '')))
    ).slice(0, maxFiles);
    onFilesUploaded(files as File[]);
  }, [onFilesUploaded, acceptedTypes, maxFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file =>
      acceptedTypes.some(type => file.type.startsWith(type.replace('*', '')))
    ).slice(0, maxFiles);
    onFilesUploaded(files as File[]);
  }, [onFilesUploaded, acceptedTypes, maxFiles]);

  return (
    <div
      className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload-input')?.click()}
    >
      <input
        id="file-upload-input"
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-white font-semibold text-lg">{title}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
      <div
        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// End of Mock Components

interface CompressedImage {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  savings: number;
  originalPreviewUrl?: string;
  compressedPreviewUrl?: string;
}

const ImageCompressor: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState(80); // Default quality
  const [targetSizeKB, setTargetSizeKB] = useState<number | ''>(''); // Target size in KB
  const [targetFormat, setTargetFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original'); // Target output format
  const [targetWidth, setTargetWidth] = useState<number | ''>(''); // Target width for resizing
  const [targetHeight, setTargetHeight] = useState<number | ''>(''); // Target height for resizing
  const [compressionMethod, setCompressionMethod] = useState<'quality' | 'size'>('quality'); // 'quality' or 'size'
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Effect to clean up object URLs when images change or component unmounts
  useEffect(() => {
    return () => {
      compressedImages.forEach(img => {
        if (img.originalPreviewUrl) URL.revokeObjectURL(img.originalPreviewUrl);
        if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl);
      });
      // Also revoke for images that were uploaded but not compressed yet
      images.forEach(file => {
        // Assuming originalPreviewUrl is stored temporarily for uncompressed images too
        // For simplicity, we'll just handle compressed images here, or add a separate state for original preview URLs
      });
    };
  }, [compressedImages, images]);

  const handleFileUpload = useCallback((files: File[]) => {
    setError(null);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const filesWithPreviews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file) // Create preview URL for original images
    }));
    setImages(imageFiles);
    setCompressedImages([]);
  }, []);

  const removeImage = (indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    setCompressedImages(prevCompressed => prevCompressed.filter((_, index) => index !== indexToRemove));
    // Revoke URL for the removed image if it had a preview
  };

  const compressImages = async () => {
    if (images.length === 0) {
      setError('Please upload images first.');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    const compressed: CompressedImage[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('compressionMethod', compressionMethod);
        if (compressionMethod === 'quality') {
          formData.append('quality', quality.toString());
        } else { // 'size' method
          if (targetSizeKB === '' || targetSizeKB <= 0) {
            setError('Please enter a valid target size in KB.');
            setProcessing(false);
            return;
          }
          formData.append('targetSizeKB', targetSizeKB.toString());
        }

        if (targetFormat !== 'original') {
          formData.append('targetFormat', targetFormat);
        }
        if (targetWidth !== '') {
          formData.append('targetWidth', targetWidth.toString());
        }
        if (targetHeight !== '') {
          formData.append('targetHeight', targetHeight.toString());
        }

        const response = await fetch(`${BASE_URL}/compress-image`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const savings = Math.round(((file.size - blob.size) / file.size) * 100);

          const originalPreviewUrl = URL.createObjectURL(file);
          const compressedPreviewUrl = URL.createObjectURL(blob);

          compressed.push({
            original: file,
            compressed: blob,
            originalSize: file.size,
            compressedSize: blob.size,
            savings,
            originalPreviewUrl,
            compressedPreviewUrl,
          });
        } else {
          const errorData = await response.json();
          setError(`Compression failed for ${file.name}: ${errorData.error || 'Unknown error'}`);
          console.error('Compression failed:', errorData);
        }
      } catch (error: any) {
        setError(`Compression failed for ${file.name}: ${error.message || 'Network error'}`);
        console.error('Compression failed:', error);
      }

      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setCompressedImages(compressed);
    setProcessing(false);
  };

  const downloadImage = (compressedImage: CompressedImage) => {
    const url = compressedImage.compressedPreviewUrl || URL.createObjectURL(compressedImage.compressed);
    const a = document.createElement('a');
    a.href = url;
    // Determine the correct file extension for download
    const originalName = compressedImage.original.name;
    const originalExt = originalName.split('.').pop();
    let downloadFileName = `compressed_${originalName.replace(`.${originalExt}`, '')}`;

    if (targetFormat !== 'original') {
      downloadFileName += `.${targetFormat}`;
    } else {
      downloadFileName += `.${originalExt}`;
    }

    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // URL.revokeObjectURL(url); // Revoke only if it was newly created for download, not if it's a state-managed preview URL
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <ImageIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Image Compressor</h1>
          <p className="text-gray-300 text-lg">Reduce image file sizes while maintaining quality</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
          <FileUploadZone
            onFilesUploaded={handleFileUpload}
            acceptedTypes={['image/*']}
            maxFiles={10}
            icon={Upload}
            title="Drag & Drop images here or click to browse"
            subtitle="Supports JPG, PNG, GIF, WebP • Max 10 files"
          />

          {images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Uploaded Images ({images.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {images.map((file, index) => (
                  <div key={file.name + index} className="relative bg-white/5 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove image"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-24 h-24 object-contain rounded-md mb-2"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} // Revoke URL after image loads
                    />
                    <p className="text-sm text-white truncate w-full px-2">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-6 mb-6">
                {/* Compression Method Selection */}
                <div className="flex items-center space-x-4">
                  <Sliders className="h-5 w-5 text-gray-400" />
                  <label className="text-white font-medium">Compression Method:</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-500"
                        name="compressionMethod"
                        value="quality"
                        checked={compressionMethod === 'quality'}
                        onChange={() => setCompressionMethod('quality')}
                      />
                      <span className="ml-2 text-white">Quality (%)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-purple-500"
                        name="compressionMethod"
                        value="size"
                        checked={compressionMethod === 'size'}
                        onChange={() => setCompressionMethod('size')}
                      />
                      <span className="ml-2 text-white">Target Size (KB)</span>
                    </label>
                  </div>
                </div>

                {/* Quality Slider */}
                {compressionMethod === 'quality' && (
                  <div className="flex items-center space-x-4">
                    <Sliders className="h-5 w-5 text-gray-400" />
                    <label className="text-white font-medium min-w-[120px]">Quality: {quality}%</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}

                {/* Target Size Input */}
                {compressionMethod === 'size' && (
                  <div className="flex items-center space-x-4">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <label className="text-white font-medium min-w-[120px]">Target Size:</label>
                    <input
                      type="number"
                      min="1"
                      value={targetSizeKB}
                      onChange={(e) => setTargetSizeKB(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                      placeholder="e.g., 200"
                      className="flex-1 p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">KB</span>
                  </div>
                )}

                {/* Target Format */}
                <div className="flex items-center space-x-4">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <label className="text-white font-medium min-w-[120px]">Output Format:</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as 'original' | 'jpeg' | 'png' | 'webp')}
                    className="flex-1 p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="original">Original</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                {/* Resolution */}
                <div className="flex items-center space-x-4">
                  <Maximize className="h-5 w-5 text-gray-400" />
                  <label className="text-white font-medium min-w-[120px]">Resolution:</label>
                  <input
                    type="number"
                    min="1"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    placeholder="Width (px)"
                    className="w-1/2 p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">x</span>
                  <input
                    type="number"
                    min="1"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    placeholder="Height (px)"
                    className="w-1/2 p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 flex items-center space-x-2">
                  <XCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={compressImages}
                disabled={processing || images.length === 0 || (compressionMethod === 'size' && targetSizeKB === '')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {processing ? 'Compressing...' : `Compress ${images.length} Image${images.length > 1 ? 's' : ''}`}
              </button>

              {processing && (
                <div className="mt-4">
                  <ProgressBar progress={progress} />
                </div>
              )}
            </div>
          )}

          {compressedImages.length > 0 && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-white mb-6">Compression Results</h3>
              <div className="space-y-6">
                {compressedImages.map((img, index) => (
                  <div key={img.original.name + index} className="bg-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 border border-white/10 shadow-md">
                    <div className="flex-shrink-0 text-center">
                      <p className="text-white font-medium mb-2">{img.original.name}</p>
                      <div className="flex space-x-4">
                        {img.originalPreviewUrl && (
                          <div className="flex flex-col items-center">
                            <img
                              src={img.originalPreviewUrl}
                              alt="Original"
                              className="w-24 h-24 object-contain rounded-md border border-gray-600 shadow-sm"
                            />
                            <p className="text-gray-400 text-xs mt-1">Original ({formatFileSize(img.originalSize)})</p>
                          </div>
                        )}
                        {img.compressedPreviewUrl && (
                          <div className="flex flex-col items-center">
                            <img
                              src={img.compressedPreviewUrl}
                              alt="Compressed"
                              className="w-24 h-24 object-contain rounded-md border border-gray-600 shadow-sm"
                            />
                            <p className="text-gray-400 text-xs mt-1">Compressed ({formatFileSize(img.compressedSize)})</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-grow text-center md:text-left">
                      <p className="text-gray-400 text-sm">
                        Original Size: <span className="text-white font-semibold">{formatFileSize(img.originalSize)}</span>
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Compressed Size: <span className="text-white font-semibold">{formatFileSize(img.compressedSize)}</span>
                      </p>
                      <p className="text-green-400 font-bold text-lg mt-2">
                        Savings: {img.savings}% smaller!
                      </p>
                    </div>

                    <button
                      onClick={() => downloadImage(img)}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ImageCompressor;
