
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Studio } from './components/Studio';
import { GalleryItem, GenerationConfig } from './types';
import { MOCK_GALLERY } from './constants';
import { Lock, Zap, Settings, X, ArrowRight } from 'lucide-react';
import { Button } from './components/Button';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery'>('studio');
  const [studioConfig, setStudioConfig] = useState<any>(undefined);

  // Supabase Session State
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(MOCK_GALLERY);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // API Key State (Still needed for direct Gemini calls if not proxied)
  const [manualKey, setManualKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Check for saved API key
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey) setManualKey(localKey);

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveManualKey = () => {
    if (manualKey.trim().length > 10) {
      localStorage.setItem('gemini_api_key', manualKey.trim());
      setShowSettings(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setManualKey('');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Gallery Actions
  const handleUsePrompt = (item: GalleryItem) => {
    setStudioConfig({
      style: item.tags.style,
      lighting: item.tags.lighting,
      camera: item.tags.camera,
    });
    // Increment usage count locally for now
    setGalleryItems(prev => prev.map(i =>
      i.id === item.id
        ? { ...i, usageCount: i.usageCount + 1 }
        : i
    ));
    setActiveTab('studio');

    setTimeout(() => {
      const studioSection = document.getElementById('studio-section');
      if (studioSection) {
        studioSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleToggleLike = (id: string) => {
    const isLiked = likedIds.has(id);
    const newLikedIds = new Set(likedIds);
    if (isLiked) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }
    setLikedIds(newLikedIds);

    setGalleryItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, likes: item.likes + (isLiked ? -1 : 1) }
        : item
    ));
  };

  const handlePublishToGallery = (imageUrl: string, config: GenerationConfig, prompt: string) => {
    // In a real implementation, this would save to Supabase "Generations" table
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      url: imageUrl,
      prompt: prompt,
      likes: 0,
      usageCount: 0,
      tags: {
        style: config.style,
        lighting: config.lighting,
        camera: config.camera
      }
    };
    setGalleryItems(prev => [newItem, ...prev]);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-8 h-8 bg-black animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-[#111]">

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border-2 border-black shadow-[8px_8px_0px_0px_white]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg uppercase tracking-wider">Configuration</h3>
              <button onClick={() => setShowSettings(false)} className="hover:bg-gray-100 p-1 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Current API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={manualKey || '••••••••••••••••'}
                    disabled
                    className="flex-1 bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-500"
                  />
                  <Button size="sm" variant="outline" onClick={handleClearKey} className="text-red-500 border-red-200 hover:border-red-500">
                    Reset
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                To switch accounts, click Reset and enter a new key from a different project.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold tracking-tighter text-xl hidden md:inline">NEUE STUDIO</span>
            <span className="font-bold tracking-tighter text-xl md:hidden">NEUE</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Key Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowSettings(true)}>
              <div className={`w-2 h-2 rounded-full ${session ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-[10px] font-mono uppercase text-gray-500">
                {session ? (session.user.email || 'Connected') : 'Guest Mode'}
              </span>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="md:hidden p-2 text-gray-500 hover:text-black"
            >
              <Settings size={20} />
            </button>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
              >
                Studio
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {activeTab === 'studio' && (
          <>
            <Hero />
            {/* Embedded Gallery Module (Compact) */}
            <Gallery
              items={galleryItems}
              onUsePrompt={handleUsePrompt}
              onToggleLike={handleToggleLike}
              likedIds={likedIds}
              compact={true}
            />
            <div id="studio-section" className="bg-white border-t border-black min-h-screen">
              <Studio
                initialConfig={studioConfig}
                onPublish={handlePublishToGallery}
              />
            </div>
          </>
        )}

        {activeTab === 'gallery' && (
          <Gallery
            items={galleryItems}
            onUsePrompt={handleUsePrompt}
            onToggleLike={handleToggleLike}
            likedIds={likedIds}
            compact={false}
          />
        )}
      </main>

      <footer className="bg-black text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-12">
            <div>
              <h3 className="font-black text-5xl tracking-tighter mb-4">NEUE</h3>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                AI-Powered Photography Simulation.<br />
                Bridging the gap between analog soul and digital precision.
              </p>
              <a href="mailto:support@party.com.tw" className="inline-block mt-4 text-sm text-white border-b border-white hover:opacity-70 transition-opacity">
                support@party.com.tw
              </a>
            </div>

            <div className="grid grid-cols-2 gap-12 text-sm text-gray-400">
              <div className="flex flex-col gap-2">
                <span className="text-white font-bold uppercase tracking-widest mb-2">Platform</span>
                <a href="https://party.com.tw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Party.com.tw</a>
                <span className="cursor-pointer hover:text-white transition-colors">Documentation</span>
                <span className="cursor-pointer hover:text-white transition-colors">API Status</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white font-bold uppercase tracking-widest mb-2">Legal</span>
                <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
                <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                <span className="cursor-pointer hover:text-white transition-colors">Usage Guidelines</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              © 2024 Party.com.tw. All rights reserved.
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-gray-800 hover:border-gray-600 transition-colors cursor-default">
              <span className="text-xs font-bold text-gray-300">Proudly generated by</span>
              <span className="text-xs font-black text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Gemini 3</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
