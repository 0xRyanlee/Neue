
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Studio } from './components/Studio';
import { GalleryItem } from './types';
import { Lock, Zap } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery'>('studio');
  const [studioConfig, setStudioConfig] = useState<any>(undefined);
  const [hasApiKey, setHasApiKey] = useState(false);
  // Default to requiring key for full experience, but allow fallback if environment permits in theory
  const [useOwnKey, setUseOwnKey] = useState(true);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setHasApiKey(true);
        setUseOwnKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleUsePrompt = (item: GalleryItem) => {
    setStudioConfig({
        style: item.tags.style,
        lighting: item.tags.lighting,
        camera: item.tags.camera,
    });
    setActiveTab('studio');
    const studioSection = document.getElementById('studio-section');
    if (studioSection) {
       studioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (useOwnKey && !hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] p-6 relative overflow-hidden">
        <div className="swiss-grid absolute inset-0 opacity-20 pointer-events-none"></div>
        <div className="z-10 text-center max-w-md w-full">
           <div className="w-24 h-24 bg-black rounded-full mx-auto mb-8 flex items-center justify-center animate-pulse">
              <Lock className="text-white w-10 h-10" />
           </div>
           <h1 className="text-5xl font-black tracking-tighter mb-6">ACCESS REQUIRED</h1>
           <p className="text-gray-600 mb-8 font-medium">
             Neue Studio utilizes high-fidelity generative models (Gemini 3 Pro). 
             A verified API key is required to simulate the studio environment.
           </p>
           <Button onClick={handleConnect} fullWidth size="lg">
             CONNECT ACCOUNT
           </Button>
           <div className="mt-4 flex flex-col gap-2">
             <p className="text-xs text-gray-400">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-black">
                 Billing Documentation
               </a>
             </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-[#111]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold tracking-tighter text-xl">NEUE STUDIO</span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Connection Status Indicator */}
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-[10px] font-mono uppercase text-gray-500">
                    {hasApiKey ? 'Connected: Custom Key' : 'Default Mode'}
                </span>
                {hasApiKey && <Zap size={10} className="text-yellow-600 fill-yellow-600"/>}
             </div>

            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('studio')}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
                >
                    Studio
                </button>
                <button 
                    onClick={() => setActiveTab('gallery')}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
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
                <div id="studio-section" className="bg-white border-t border-black min-h-screen">
                    <Studio initialConfig={studioConfig} />
                </div>
            </>
        )}

        {activeTab === 'gallery' && (
            <Gallery onUsePrompt={handleUsePrompt} />
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
                        <a href="https://party.com.tw" className="hover:text-white transition-colors">Party.com.tw</a>
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
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-gray-800">
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
