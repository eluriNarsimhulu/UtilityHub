import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Download, Instagram, FileText, Sparkles, ArrowRight } from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  gradient: string;
}

const LandingPage: React.FC = () => {
  const tools: ToolCard[] = [
    {
      title: 'YouTube Downloader',
      description: 'Download YouTube videos and audio in multiple formats. Supports all video qualities and MP3 extraction.',
      icon: Download,
      route: '/youtube-downloader',
      gradient: 'from-red-500 to-orange-600'
    },
    {
      title: 'Image Compressor',
      description: 'Compress images while maintaining quality. Support for JPG, PNG, GIF with real-time preview.',
      icon: Image,
      route: '/image-compressor',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Image Enhancer',
      description: 'Enhance images with brightness, contrast, saturation, sharpening, and noise reduction controls.',
      icon: Sparkles,
      route: '/image-enhancer',
      gradient: 'from-purple-500 to-pink-600'
    },
    
    {
      title: 'Instagram Downloader',
      description: 'Download Instagram posts, reels, and stories. Extract video or audio from any public content.',
      icon: Instagram,
      route: '/instagram-downloader',
      gradient: 'from-pink-500 to-purple-600'
    },
    // {
    //   title: 'PDF Converter',
    //   description: 'Convert between Word documents and PDF files. Preserve formatting and layout perfectly.',
    //   icon: FileText,
    //   route: '/pdf-converter',
    //   gradient: 'from-green-500 to-teal-600'
    // }
  ];

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">
          All-in-One <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Utility Hub</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Fast, free, and powerful tools for your daily digital needs. No registration required, no ads, just pure functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {tools.map((tool, index) => (
          <Link
            key={tool.route}
            to={tool.route}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative p-8">
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tool.gradient} mb-6`}>
                <tool.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{tool.description}</p>
              
              <div className="flex items-center text-orange-400 font-semibold group-hover:text-orange-300 transition-colors">
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-center">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Why Choose UtilityHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">⚡ Lightning Fast</h3>
              <p>Optimized for speed with real-time processing and instant results.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🔒 Privacy First</h3>
              <p>All processing happens locally or temporarily. Your files are never stored.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">📱 Works Everywhere</h3>
              <p>Responsive design that works perfectly on desktop, tablet, and mobile.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;