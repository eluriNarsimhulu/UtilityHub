import React, { useState } from 'react';
import {
  Download, AlertCircle, CheckCircle, Loader2, Play, Eye,
  Heart, MessageCircle, User, XCircle, RefreshCcw
} from 'lucide-react';

interface VideoDownloadOption {
  quality: string;
  url: string;
  type: string;
}
interface VideoData {
  title: string;
  thumbnail?: string;
  duration?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  username?: string;
  caption?: string;
  url_list: VideoDownloadOption[];
  created_at?: string;
}
interface ApiResponse {
  success: boolean;
  data?: VideoData;
  error?: string;
  retryAfter?: number;
  details?: string;
}

const InstagramDownloader: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string>('');
  const [downloadingQuality, setDownloadingQuality] = useState<string>('');

  const isValidInstagramUrl = (inputUrl: string) => {
    const instagramRegex = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+(?:[\/?].*)?$/;
    return instagramRegex.test(inputUrl);
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVideoData(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter an Instagram URL.');
      return;
    }
    if (!isValidInstagramUrl(trimmedUrl)) {
      setError('Please enter a valid Instagram post, reel, or IGTV URL.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/instagram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl })
      });

      let result: ApiResponse;
      try {
        result = await response.json();
      } catch {
        throw new Error('Server did not return a valid JSON response.');
      }

      if (response.ok && result.success && result.data) {
        setVideoData(result.data);
      } else {
        // Handle API-specific errors returned in the JSON body
        let errorMessage = result.error || 'Failed to fetch video. Please try again later.';
        if (response.status === 429 && result.retryAfter) {
          errorMessage += ` You can retry in ${result.retryAfter} seconds.`;
        }
        setError(errorMessage);
        console.error('API Error:', result.error, result.details);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected network error occurred.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl: string, quality: string) => {
    setDownloadingQuality(quality);
    setError('');
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Failed to fetch video from source (${response.status} ${response.statusText}).`);

      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      a.download = `instagram_video_${videoData?.username || 'download'}_${quality.toLowerCase().replace(/\s/g, '-')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObject);
    } catch (err: any) {
      setError(err?.message || 'Failed to start download. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloadingQuality('');
    }
  };

  const clearResults = () => {
    setVideoData(null);
    setError('');
    setUrl('');
    setLoading(false);
    setDownloadingQuality('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 font-sans text-gray-100">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              IG Downloader
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Effortlessly download Instagram Videos, Reels, and IGTV content directly to your device.
          </p>
        </div>
        {/* Warning */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl mb-8 text-white shadow-lg border border-orange-400">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">⚠️ Important Notice</h3>
              <p className="text-sm leading-relaxed">
                This tool is provided for educational and personal use only. Please ensure you have the necessary
                permissions before downloading or re-sharing copyrighted content. Respect Instagram's Terms of Service
                and intellectual property rights.
              </p>
            </div>
          </div>
        </div>
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative mb-6">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Paste Instagram video/reel URL here (e.g., https://www.instagram.com/p/...)"
                className="w-full px-6 py-4 text-lg bg-white/20 border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading || downloadingQuality !== ''}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={loading || !url.trim() || downloadingQuality !== ''}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing URL...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    <span>Get Video</span>
                  </>
                )}
              </button>
              {(videoData || error) && (
                <button
                  type="button"
                  onClick={clearResults}
                  className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 text-lg"
                >
                  <RefreshCcw className="w-5 h-5" />
                  <span>New Search</span>
                </button>
              )}
            </div>
          </form>
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100 flex items-center space-x-3 shadow-md">
              <XCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-base">{error}</span>
            </div>
          )}
          {/* Success */}
          {videoData && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-7 h-7 text-green-400" />
                <h3 className="text-2xl font-semibold text-white">Video Found!</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Video Info */}
                <div className="space-y-5">
                  <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                    <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <Play className="w-5 h-5" /> <span>Video Information</span>
                    </h4>
                    <div className="space-y-3 text-gray-200 text-base">
                      <div className="flex items-start space-x-2">
                        <span className="font-medium flex-shrink-0 w-20">Title:</span>
                        <span className="flex-1">{videoData.title}</span>
                      </div>
                      {videoData.username && (
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium w-20">User:</span>
                          <span>@{videoData.username}</span>
                        </div>
                      )}
                      {videoData.duration && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium flex-shrink-0 w-20">Duration:</span>
                          <span>{videoData.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-gray-300 text-sm">
                      {videoData.view_count !== null && videoData.view_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>Views: {formatNumber(videoData.view_count)}</span>
                        </div>
                      )}
                      {videoData.like_count !== null && videoData.like_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>Likes: {formatNumber(videoData.like_count)}</span>
                        </div>
                      )}
                      {videoData.comment_count !== null && videoData.comment_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>Comments: {formatNumber(videoData.comment_count)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Caption */}
                  {videoData.caption && (
                    <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                      <h5 className="font-semibold text-white mb-3 text-lg">Caption:</h5>
                      <p className="text-gray-300 text-sm leading-relaxed max-h-24 overflow-hidden overflow-y-auto custom-scrollbar">
                        {videoData.caption}
                      </p>
                    </div>
                  )}
                </div>
                {/* Download options */}
                <div className="space-y-5">
                  <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                    <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <Download className="w-5 h-5" /> <span>Download Options</span>
                    </h4>
                    <div className="space-y-4">
                      {videoData.url_list.length > 0 ? (
                        videoData.url_list.map((video, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleDownload(video.url, video.quality)}
                            disabled={downloadingQuality !== ''}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3 text-base"
                          >
                            {downloadingQuality === video.quality ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Downloading {video.quality}...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5" />
                                <span>Download {video.quality}</span>
                                <span className="text-xs opacity-75">({video.type.split('/')[1].toUpperCase()})</span>
                              </>
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">No direct video download links found for this content.</p>
                      )}
                    </div>
                  </div>
                  {/* Thumbnail */}
                  {videoData.thumbnail && (
                    <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                      <h5 className="font-semibold text-white mb-3 text-lg">Thumbnail Preview:</h5>
                      <img
                        src={videoData.thumbnail}
                        alt="Video thumbnail"
                        className="w-full h-auto rounded-lg shadow-md border border-white/10"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">
            Developed with ❤️ for educational and personal use only.
          </p>
          <p className="text-sm mt-1">
            Always respect copyright and content creators' rights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramDownloader;
