// // import React, { useState } from 'react';
// // import { Download, Youtube, Music, Video, AlertCircle } from 'lucide-react';

// // interface VideoInfo {
// //   title: string;
// //   thumbnail: string;
// //   duration: string;
// //   author: string;
// // }

// // const YoutubeDownloader: React.FC = () => {
// //   const [url, setUrl] = useState('');
// //   const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [downloadFormat, setDownloadFormat] = useState<'mp4' | 'mp3'>('mp4');
// //   const [quality, setQuality] = useState('720p');

// //   const validateYouTubeUrl = (url: string) => {
// //     const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
// //     return regex.test(url);
// //   };

// //   const fetchVideoInfo = async () => {
// //     if (!url.trim()) {
// //       setError('Please enter a YouTube URL');
// //       return;
// //     }

// //     if (!validateYouTubeUrl(url)) {
// //       setError('Please enter a valid YouTube URL');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');
// //     setVideoInfo(null);

// //     try {
// //       const response = await fetch('/api/youtube-info', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ url }),
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setVideoInfo(data);
// //       } else {
// //         const errorData = await response.json();
// //         setError(errorData.error || 'Failed to fetch video information');
// //       }
// //     } catch (err) {
// //       setError('Network error. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadVideo = async () => {
// //     if (!videoInfo || !url) return;

// //     try {
// //       const response = await fetch('/api/youtube-download', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           url, 
// //           format: downloadFormat,
// //           quality: downloadFormat === 'mp4' ? quality : '128kbps'
// //         }),
// //       });

// //       if (response.ok) {
// //         const blob = await response.blob();
// //         const downloadUrl = URL.createObjectURL(blob);
// //         const a = document.createElement('a');
// //         a.href = downloadUrl;
// //         a.download = `${videoInfo.title}.${downloadFormat}`;
// //         document.body.appendChild(a);
// //         a.click();
// //         document.body.removeChild(a);
// //         URL.revokeObjectURL(downloadUrl);
// //       } else {
// //         setError('Download failed. Please try again.');
// //       }
// //     } catch (err) {
// //       setError('Download failed. Please try again.');
// //     }
// //   };

// //   return (
// //     <main className="container mx-auto px-4 py-8">
// //       <div className="max-w-3xl mx-auto">
// //         <div className="text-center mb-8">
// //           <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 mb-4">
// //             <Youtube className="h-8 w-8 text-white" />
// //           </div>
// //           <h1 className="text-3xl font-bold text-white mb-2">YouTube Downloader</h1>
// //           <p className="text-gray-300">Download YouTube videos and audio in high quality</p>
// //         </div>

// //         <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
// //           <div className="mb-6">
// //             <label className="block text-white font-medium mb-2">YouTube URL</label>
// //             <div className="flex space-x-2">
// //               <input
// //                 type="url"
// //                 value={url}
// //                 onChange={(e) => setUrl(e.target.value)}
// //                 placeholder="https://www.youtube.com/watch?v=..."
// //                 className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50"
// //               />
// //               <button
// //                 onClick={fetchVideoInfo}
// //                 disabled={loading}
// //                 className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
// //               >
// //                 {loading ? 'Loading...' : 'Get Info'}
// //               </button>
// //             </div>
// //             {error && (
// //               <div className="mt-2 flex items-center space-x-2 text-red-400">
// //                 <AlertCircle className="h-4 w-4" />
// //                 <span className="text-sm">{error}</span>
// //               </div>
// //             )}
// //           </div>

// //           {videoInfo && (
// //             <div className="space-y-6">
// //               <div className="bg-white/5 rounded-lg p-4">
// //                 <div className="flex space-x-4">
// //                   <img 
// //                     src={videoInfo.thumbnail} 
// //                     alt="Video thumbnail"
// //                     className="w-32 h-24 object-cover rounded-lg"
// //                   />
// //                   <div className="flex-1">
// //                     <h3 className="text-white font-bold mb-2">{videoInfo.title}</h3>
// //                     <p className="text-gray-400 text-sm mb-1">By {videoInfo.author}</p>
// //                     <p className="text-gray-400 text-sm">Duration: {videoInfo.duration}</p>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-white font-medium mb-2">Format</label>
// //                   <div className="flex space-x-2">
// //                     <button
// //                       onClick={() => setDownloadFormat('mp4')}
// //                       className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
// //                         downloadFormat === 'mp4' 
// //                           ? 'bg-orange-500 text-white' 
// //                           : 'bg-white/10 text-gray-300 hover:bg-white/20'
// //                       }`}
// //                     >
// //                       <Video className="h-4 w-4" />
// //                       <span>MP4 Video</span>
// //                     </button>
// //                     <button
// //                       onClick={() => setDownloadFormat('mp3')}
// //                       className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
// //                         downloadFormat === 'mp3' 
// //                           ? 'bg-orange-500 text-white' 
// //                           : 'bg-white/10 text-gray-300 hover:bg-white/20'
// //                       }`}
// //                     >
// //                       <Music className="h-4 w-4" />
// //                       <span>MP3 Audio</span>
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div>
// //                   <label className="block text-white font-medium mb-2">Quality</label>
// //                   <select
// //                     value={quality}
// //                     onChange={(e) => setQuality(e.target.value)}
// //                     className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-400"
// //                   >
// //                     {downloadFormat === 'mp4' ? (
// //                       <>
// //                         <option value="1080p">1080p HD</option>
// //                         <option value="720p">720p HD</option>
// //                         <option value="480p">480p</option>
// //                         <option value="360p">360p</option>
// //                       </>
// //                     ) : (
// //                       <>
// //                         <option value="320kbps">320 kbps</option>
// //                         <option value="256kbps">256 kbps</option>
// //                         <option value="128kbps">128 kbps</option>
// //                       </>
// //                     )}
// //                   </select>
// //                 </div>
// //               </div>

// //               <button
// //                 onClick={downloadVideo}
// //                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
// //               >
// //                 <Download className="h-5 w-5" />
// //                 <span>Download {downloadFormat.toUpperCase()}</span>
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </main>
// //   );
// // };

// // export default YoutubeDownloader;




// import React, { useState } from 'react';
// import { Download, Youtube, Music, Video, AlertCircle, Loader } from 'lucide-react';
// import BASE_URL from '../config';

// interface VideoInfo {
//   title: string;
//   thumbnail: string;
//   duration: string;
//   author: string;
//   videoId: string; // Add videoId to VideoInfo
// }

// const YoutubeDownloader: React.FC = () => {
//   const [url, setUrl] = useState('');
//   const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [downloadFormat, setDownloadFormat] = useState<'mp4' | 'mp3'>('mp4');
//   const [quality, setQuality] = useState('720p');
//   const [downloading, setDownloading] = useState(false); // New state for download loading

//   /**
//    * Validates if the given URL is a valid YouTube URL.
//    * @param url The URL string to validate.
//    * @returns True if the URL is a valid YouTube URL, false otherwise.
//    */
//   const validateYouTubeUrl = (url: string) => {
//     const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
//     return regex.test(url);
//   };

//   /**
//    * Extracts the YouTube video ID from a given YouTube URL.
//    * @param url The YouTube URL string.
//    * @returns The 11-character YouTube video ID, or null if not found.
//    */
//   const getYouTubeVideoId = (url: string) => {
//     const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
//     const match = url.match(regExp);
//     return (match && match[1]) ? match[1] : null;
//   };

//   /**
//    * Fetches video information from the provided YouTube URL.
//    * Sets loading state, handles errors, and updates videoInfo state.
//    */
//   const fetchVideoInfo = async () => {
//     if (!url.trim()) {
//       setError('Please enter a YouTube URL');
//       return;
//     }

//     if (!validateYouTubeUrl(url)) {
//       setError('Please enter a valid YouTube URL');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setVideoInfo(null);

//     try {
//       const response = await fetch(`${BASE_URL}/youtube-info`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ url }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const videoId = getYouTubeVideoId(url); // Extract video ID
//         setVideoInfo({ ...data, videoId }); // Store videoId along with other info
//       } else {
//         const errorData = await response.json();
//         setError(errorData.error || 'Failed to fetch video information');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Initiates the video download process.
//    * Shows a loading indicator for a few seconds before triggering the actual download.
//    */
//   const downloadVideo = async () => {
//     if (!videoInfo || !url) return;

//     setDownloading(true); // Start downloading state
//     setError('');

//     // Simulate a short delay (3-4 seconds) before actual download starts
//     // This provides visual feedback to the user that the download is being prepared.
//     setTimeout(async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/youtube-download`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             url,
//             format: downloadFormat,
//             quality: downloadFormat === 'mp4' ? quality : '128kbps' // Quality for MP3 is fixed
//           }),
//         });

//         if (response.ok) {
//           const blob = await response.blob();
//           const downloadUrl = URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = downloadUrl;
//           a.download = `${videoInfo.title}.${downloadFormat}`; // Set filename for download
//           document.body.appendChild(a);
//           a.click(); // Trigger download
//           document.body.removeChild(a);
//           URL.revokeObjectURL(downloadUrl); // Clean up the object URL
//         } else {
//           const errorData = await response.json();
//           setError(errorData.error || 'Download failed. Please try again.');
//         }
//       } catch (err) {
//         setError('Download failed. Please try again.');
//       } finally {
//         setDownloading(false); // End downloading state regardless of success or failure
//       }
//     }, 3000); // 3-second delay to show "Preparing Download..."
//   };

//   return (
//     <main className="container mx-auto px-4 py-8 font-inter">
//       <div className="max-w-3xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 mb-4 shadow-lg">
//             <Youtube className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">YouTube Downloader</h1>
//           <p className="text-gray-300">Download YouTube videos and audio in high quality</p>
//         </div>

//         {/* Main Content Area */}
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
//           {/* URL Input Section */}
//           <div className="mb-6">
//             <label htmlFor="youtube-url" className="block text-white font-medium mb-2">YouTube URL</label>
//             <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
//               <input
//                 id="youtube-url"
//                 type="url"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 placeholder="https://www.youtube.com/watch?v=..."
//                 className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all duration-200"
//               />
//               <button
//                 onClick={fetchVideoInfo}
//                 disabled={loading}
//                 className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
//               >
//                 {loading ? 'Loading...' : 'Get Info'}
//               </button>
//             </div>
//             {error && (
//               <div className="mt-2 flex items-center space-x-2 text-red-400">
//                 <AlertCircle className="h-4 w-4" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             )}
//           </div>

//           {/* Video Info and Download Options Section */}
//           {videoInfo && (
//             <div className="space-y-6">
//               {/* Video Details and Embed */}
//               <div className="bg-white/5 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
//                 {videoInfo.videoId && (
//                   <div className="flex-shrink-0 w-full md:w-auto">
//                     {/* Embedded YouTube video */}
//                     <iframe
//                       width="100%" // Make iframe responsive
//                       height="192" // Fixed height for consistency
//                       src={`https://www.youtube.com/embed/${videoInfo.videoId}`}
//                       title="YouTube video player"
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                       className="rounded-lg shadow-lg"
//                     ></iframe>
//                   </div>
//                 )}
//                 <div className="flex-1 text-center md:text-left">
//                   <h3 className="text-white text-xl font-bold mb-2">{videoInfo.title}</h3>
//                   <p className="text-gray-400 text-sm mb-1">By {videoInfo.author}</p>
//                   <p className="text-gray-400 text-sm">Duration: {videoInfo.duration}</p>
//                 </div>
//               </div>

//               {/* Format and Quality Selection */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Format Selection */}
//                 <div>
//                   <label className="block text-white font-medium mb-2">Format</label>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => setDownloadFormat('mp4')}
//                       className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 shadow-md ${
//                         downloadFormat === 'mp4'
//                           ? 'bg-orange-500 text-white'
//                           : 'bg-white/10 text-gray-300 hover:bg-white/20'
//                       }`}
//                     >
//                       <Video className="h-4 w-4" />
//                       <span>MP4 Video</span>
//                     </button>
//                     <button
//                       onClick={() => setDownloadFormat('mp3')}
//                       className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 shadow-md ${
//                         downloadFormat === 'mp3'
//                           ? 'bg-orange-500 text-white'
//                           : 'bg-white/10 text-gray-300 hover:bg-white/20'
//                       }`}
//                     >
//                       <Music className="h-4 w-4" />
//                       <span>MP3 Audio</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Quality Selection */}
//                 <div>
//                   <label htmlFor="quality-select" className="block font-medium mb-2">Quality</label>
//                   <select
//                     id="quality-select"
//                     value={quality}
//                     onChange={(e) => setQuality(e.target.value)}
//                     className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white"
//                   >
//                     {downloadFormat === 'mp4' ? (
//                       <>
//                         <option value="1080p">1080p HD</option>
//                         <option value="720p">720p HD</option>
//                         <option value="480p">480p</option>
//                         <option value="360p">360p</option>
//                       </>
//                     ) : (
//                       <>
//                         <option value="320kbps">320 kbps</option>
//                         <option value="256kbps">256 kbps</option>
//                         <option value="128kbps">128 kbps</option>
//                       </>
//                     )}
//                   </select>
//                 </div>
//               </div>

//               {/* Download Button */}
//               <button
//                 onClick={downloadVideo}
//                 disabled={downloading} // Disable button when downloading
//                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
//               >
//                 {downloading ? (
//                   <>
//                     <Loader className="h-5 w-5 animate-spin" />
//                     <span>Preparing Download...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Download className="h-5 w-5" />
//                     <span>Download {downloadFormat.toUpperCase()}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// };

// export default YoutubeDownloader;




import React, { useState } from 'react';
import { Download, Youtube, Music, Video, AlertCircle, Loader } from 'lucide-react';
import BASE_URL from '../config';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoId: string; // Add videoId to VideoInfo
}

const YoutubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [quality, setQuality] = useState('720p');
  const [downloading, setDownloading] = useState(false); // New state for download loading

  /**
   * Validates if the given URL is a valid YouTube URL.
   * @param url The URL string to validate.
   * @returns True if the URL is a valid YouTube URL, false otherwise.
   */
  const validateYouTubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
  };

  /**
   * Extracts the YouTube video ID from a given YouTube URL.
   * @param url The YouTube URL string.
   * @returns The 11-character YouTube video ID, or null if not found.
   */
  const getYouTubeVideoId = (url: string) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  /**
   * Fetches video information from the provided YouTube URL.
   * Sets loading state, handles errors, and updates videoInfo state.
   */
  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`${BASE_URL}/youtube-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        const videoId = getYouTubeVideoId(url); // Extract video ID
        setVideoInfo({ ...data, videoId }); // Store videoId along with other info
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch video information');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates the video download process.
   * Shows a loading indicator for a few seconds before triggering the actual download.
   */
  const downloadVideo = async () => {
    if (!videoInfo || !url) return;

    setDownloading(true); // Start downloading state
    setError('');

    // Simulate a short delay (3-4 seconds) before actual download starts
    // This provides visual feedback to the user that the download is being prepared.
    setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/youtube-download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            format: downloadFormat,
            quality: downloadFormat === 'mp4' ? quality : '128kbps' // Quality for MP3 is fixed
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${videoInfo.title}.${downloadFormat}`; // Set filename for download
          document.body.appendChild(a);
          a.click(); // Trigger download
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl); // Clean up the object URL
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Download failed. Please try again.');
        }
      } catch (err) {
        setError('Download failed. Please try again.');
      } finally {
        setDownloading(false); // End downloading state regardless of success or failure
      }
    }, 3000); // 3-second delay to show "Preparing Download..."
  };

  return (
    <main className="container mx-auto px-4 py-8 font-inter">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 mb-4 shadow-lg">
            <Youtube className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">YouTube Downloader</h1>
          <p className="text-gray-300">Download YouTube videos and audio in high quality</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
          {/* URL Input Section */}
          <div className="mb-6">
            <label htmlFor="youtube-url" className="block text-white font-medium mb-2">YouTube URL</label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                // MODIFIED: Updated placeholder for better guidance
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all duration-200"
              />
              <button
                onClick={fetchVideoInfo}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Loading...' : 'Get Info'}
              </button>
            </div>
            {error && (
              <div className="mt-2 flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Video Info and Download Options Section */}
          {videoInfo && (
            <div className="space-y-6">
              {/* Video Details and Embed */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                {videoInfo.videoId && (
                  <div className="flex-shrink-0 w-full md:w-auto">
                    {/* Embedded YouTube video - URL confirmed to be correct */}
                    <iframe
                      width="100%" // Make iframe responsive
                      height="192" // Fixed height for consistency
                      src={`https://www.youtube.com/embed/${videoInfo.videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg shadow-lg"
                    ></iframe>
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-white text-xl font-bold mb-2">{videoInfo.title}</h3>
                  <p className="text-gray-400 text-sm mb-1">By {videoInfo.author}</p>
                  <p className="text-gray-400 text-sm">Duration: {videoInfo.duration}</p>
                </div>
              </div>

              {/* Format and Quality Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format Selection */}
                <div>
                  <label className="block text-white font-medium mb-2">Format</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setDownloadFormat('mp4')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 shadow-md ${
                        downloadFormat === 'mp4'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Video className="h-4 w-4" />
                      <span>MP4 Video</span>
                    </button>
                    <button
                      onClick={() => setDownloadFormat('mp3')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 shadow-md ${
                        downloadFormat === 'mp3'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Music className="h-4 w-4" />
                      <span>MP3 Audio</span>
                    </button>
                  </div>
                </div>

                {/* Quality Selection */}
                <div>
                  <label htmlFor="quality-select" className="block text-white font-medium mb-2">Quality</label>
                  <select
                    id="quality-select"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-400"
                  >
                    {downloadFormat === 'mp4' ? (
                      <>
                        <option value="1080p">1080p HD</option>
                        <option value="720p">720p HD</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </>
                    ) : (
                      <>
                        <option value="320kbps">320 kbps</option>
                        <option value="256kbps">256 kbps</option>
                        <option value="128kbps">128 kbps</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadVideo}
                disabled={downloading} // Disable button when downloading
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {downloading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Download {downloadFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default YoutubeDownloader;
