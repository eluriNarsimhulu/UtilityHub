import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ImageCompressor from './pages/ImageCompressor';
import YoutubeDownloader from './pages/YoutubeDownloader';
import InstagramDownloader from './pages/InstagramDownloader';
// import PdfConverter from './pages/PdfConverter';
import ImageEnhancer from './pages/ImageEnhancer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/youtube-downloader" element={<YoutubeDownloader />} />
          <Route path="/instagram-downloader" element={<InstagramDownloader />} />
          {/* <Route path="/pdf-converter" element={<PdfConverter />} /> */}
          <Route path="/image-enhancer" element={<ImageEnhancer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;