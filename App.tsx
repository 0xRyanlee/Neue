
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Studio } from './components/Studio';
import { GalleryItem, GenerationConfig } from './types';
import { MOCK_GALLERY } from './constants';
import { Lock, Zap, Settings, X, ArrowRight } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery'>('studio');
  const [studioConfig, setStudioConfig] = useState<any>(undefined);
  
  // Gallery State (Lifted)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(MOCK_GALLERY);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Auth State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualKey, setManualKey] = useState('');

  // Check for API Key on mount (Auto-detect environment or LocalStorage)
  useEffect(() => {
    const checkKey = async () => {
      // 1. Check AI Studio (Dev Environment)
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasSelected = await aistudio.hasSelectedApiKey();
        if (hasSelected) {
            setHasApiKey(true);
            return;
        }
      }

      // 2. Check LocalStorage (Production/User override)
      const localKey = localStorage.getItem('gemini_api_key');
      if (localKey) {
        setHasApiKey(true);
        setManualKey(localKey); // Populate input for visibility
      }
      
      // 3. Check Env (Optional fallback, usually for free tier)
      if (process.env.API_KEY && !localKey) {
          // We can assume valid if env is present, but manual/AI Studio is preferred for Billing
          // setHasApiKey(true); 
      }
    };
    checkKey();
  }, []);

  const handleAIStudioConnect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleSaveManualKey = () => {
      if (manualKey.trim().length > 10) {
          localStorage.setItem('gemini_api_key', manualKey.trim());
          setHasApiKey(true);
          setShowSettings(false);
          window.location.reload(); 
      }
  };

  const handleClearKey = () => {
      localStorage.removeItem('gemini_api_key');
      setManualKey('');
      setHasApiKey(false);
  };
  
  const handleSkip = () => {
      setHasApiKey(true);
  };

  // Gallery Actions
  const handleUsePrompt = (item: GalleryItem) => {
    setStudioConfig({
        style: item.tags.style,
        lighting: item.tags.lighting,
        camera: item.tags.camera,
    });
    // Increment usage count
    setGalleryItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, usageCount: i.usageCount + 1 }
          : i
    ));
    setActiveTab('studio');
    
    // Smooth scroll to studio
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

  // Render Lock Screen if no key found
  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] p-6 relative overflow-hidden">
        <div className="swiss-grid absolute inset-0 opacity-20 pointer-events-none"></div>
        
        <div className="z-10 text-center max-w-md w-full bg-white p-8 border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
           {/* Close / Skip Icon */}
           <button 
             onClick={handleSkip}
             className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
             aria-label="Skip authentication"
           >
             <X size={20} />
           </button>

           <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <Lock className="text-white w-8 h-8" />
           </div>
           <h1 className="text-3xl font-black tracking-tighter mb-4">STUDIO ACCESS</h1>
           <p className="text-gray-600 mb-8 font-medium text-sm">
             Neue Studio utilizes Gemini 3 Pro (Vision). 
             Please connect a Google AI Studio account or enter a valid API Key.
           </p>
           
           <div className="space-y-4">
               {/* AI Studio Button */}
               {(window as any).aistudio && (
                   <Button onClick={handleAIStudioConnect} fullWidth size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                       <Zap size={16} className="mr-2" /> CONNECT AI STUDIO
                   </Button>
               )}

               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or enter manually</span>
                  </div>
                </div>

               <div className="flex flex-col gap-2">
                   <input 
                        type="password" 
                        placeholder="Paste your Gemini API Key (begins with AIza...)"
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        className="w-full border-2 border-gray-200 p-3 text-sm focus:border-black focus:outline-none transition-colors"
                   />
                   <Button onClick={handleSaveManualKey} fullWidth variant="primary" disabled={manualKey.length < 10}>
                       ENTER STUDIO
                   </Button>
               </div>
           </div>
           
           {/* Skip Text Link */}
           <div className="mt-8 pt-4 border-t border-gray-100">
             <button 
                onClick={handleSkip}
                className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-2 mx-auto"
             >
                Continue as Guest <ArrowRight size={14} />
             </button>
             <p className="text-[10px] text-gray-400 mt-2">
               *Guest mode uses Standard tier (Free) models where available.
             </p>
           </div>
           
           <div className="mt-4 flex flex-col gap-2">
             <p className="text-xs text-gray-400">
               <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-black">
                 Get an API Key
               </a>
             </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-[#111]">
      
      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-6 border-2 border-black shadow-[8px_8px_0px_0px_white]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg uppercase tracking-wider">Configuration</h3>
                      <button onClick={() => setShowSettings(false)} className="hover:bg-gray-100 p-1 rounded-full"><X size={20}/></button>
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
                <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-[10px] font-mono uppercase text-gray-500">
                    {manualKey ? 'Custom Key' : (hasApiKey ? 'Connected' : 'Guest Mode')}
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
                        AI-Powered Photography Simulation.<br/>
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
