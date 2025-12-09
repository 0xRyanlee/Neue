
import React, { useState, useEffect } from 'react';
import { TagSelector } from './TagSelector';
import { ChatInterface } from './ChatInterface';
import { TAG_CATEGORIES } from '../constants';
import { GenerationConfig, AspectRatio, PhotoStyle, ChatMessage } from '../types';
import { Button } from './Button';
import { createConsultationChat, sendMessageToChat, generateStudioImage, analyzeTagsFromContext } from '../services/geminiService';
import { Upload, Download, RotateCcw, Image as ImageIcon, Sparkles, MessageSquare, Wand2 } from 'lucide-react';

interface StudioProps {
  initialConfig?: Partial<GenerationConfig>;
}

export const Studio: React.FC<StudioProps> = ({ initialConfig }) => {
  const [mode, setMode] = useState<'fast' | 'consultation'>('fast');
  
  // Config State
  const [config, setConfig] = useState<GenerationConfig>({
    aspectRatio: AspectRatio.PORTRAIT,
    style: PhotoStyle.ID_PHOTO,
    lighting: TAG_CATEGORIES.find(c => c.id === 'lighting')?.options[0] || '',
    camera: TAG_CATEGORIES.find(c => c.id === 'camera')?.options[0] || '',
    environment: TAG_CATEGORIES.find(c => c.id === 'environment')?.options[0] || '',
    pose: TAG_CATEGORIES.find(c => c.id === 'pose')?.options[0] || '',
    referenceImages: []
  });

  // Smart Input State
  const [smartInput, setSmartInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle Initial Config
  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInstance, setChatInstance] = useState<any>(null);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Chat
  useEffect(() => {
    if (!chatInstance && mode === 'consultation') {
      const chat = createConsultationChat(config);
      setChatInstance(chat);
      setMessages([{
        role: 'model',
        content: `neue studio online. style: ${config.style}. upload references or describe your vision.`
      }]);
    }
  }, [mode, chatInstance, config.style]);

  const handleTagSelect = (categoryId: string, option: string) => {
    setConfig(prev => ({ ...prev, [categoryId]: option }));
  };

  const handleSmartAnalyze = async () => {
    if (!smartInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const newTags = await analyzeTagsFromContext(smartInput);
      setConfig(prev => ({
        ...prev,
        ...newTags
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const files = Array.from(e.target.files).slice(0, 3);
       const promises = files.map(file => {
          return new Promise<string>((resolve, reject) => {
             const reader = new FileReader();
             reader.onload = () => resolve(reader.result as string);
             reader.onerror = reject;
             reader.readAsDataURL(file);
          });
       });

       Promise.all(promises).then(images => {
          setConfig(prev => ({ ...prev, referenceImages: images }));
          if (mode === 'consultation') {
             setMessages(prev => [...prev, { role: 'system', content: `User uploaded ${images.length} reference images.` }]);
          }
       });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatInstance) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsChatProcessing(true);
    try {
        const responseText = await sendMessageToChat(chatInstance, text);
        setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } finally {
        setIsChatProcessing(false);
    }
  };

  const handleGenerate = async () => {
      setIsGenerating(true);
      setError(null);
      
      // Determine context based on mode
      let promptOverride = "";
      if (mode === 'consultation') {
          promptOverride = messages
            .filter(m => m.role === 'user')
            .slice(-3)
            .map(m => m.content)
            .join(" ");
      } else {
        // In Fast mode, we check for smart input first
        promptOverride = smartInput ? `Context: ${smartInput}. Follow tags.` : "Follow tags strictly. High fidelity.";
      }

      try {
          const imgUrl = await generateStudioImage(config, promptOverride);
          setGeneratedImage(imgUrl);
      } catch (err: any) {
          setError(err.message || "Failed to generate image.");
      } finally {
          setIsGenerating(false);
      }
  };

  const downloadImage = () => {
    if (generatedImage) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `neue-studio-output-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Mode Switcher */}
      <div className="flex justify-center mb-12">
         <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
               onClick={() => setMode('fast')}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${mode === 'fast' ? 'bg-black text-white shadow-md' : 'text-gray-500'}`}
            >
               <Sparkles size={14} /> Fast
            </button>
            <button
               onClick={() => setMode('consultation')}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${mode === 'consultation' ? 'bg-black text-white shadow-md' : 'text-gray-500'}`}
            >
               <MessageSquare size={14} /> Consult
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-10">
           
           {/* Smart Input (New) */}
           <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4 flex justify-between">
                <span>Vision Input</span>
                <span className="text-[10px] text-blue-600">AI-POWERED</span>
              </h3>
              <div className="relative">
                <textarea
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Describe your vision (e.g., 'Sad cyberpunk detective in rain')..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-1 focus:ring-black min-h-[80px]"
                />
                <Button 
                   onClick={handleSmartAnalyze} 
                   size="sm" 
                   disabled={!smartInput || isAnalyzing}
                   className="mt-2 w-full bg-white border border-gray-300 text-black hover:bg-gray-50"
                >
                  {isAnalyzing ? (
                    <span className="animate-pulse">ANALYZING CONTEXT...</span>
                  ) : (
                    <span className="flex items-center justify-center"><Wand2 size={12} className="mr-2"/> AUTO-CONFIGURE TAGS</span>
                  )}
                </Button>
              </div>
           </section>

           {/* Upload (Compact Swiss Style) */}
           <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4">Input Source</h3>
              <div className="flex gap-4 items-center">
                 <div className="relative w-20 h-20 rounded-full border border-black hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer group">
                    <input 
                       type="file" 
                       multiple 
                       accept="image/*" 
                       onChange={handleFileUpload}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="text-black group-hover:scale-110 transition-transform" />
                 </div>
                 <div className="text-sm">
                    <p className="font-bold">Upload References</p>
                    <p className="text-gray-500 text-xs">{config.referenceImages.length} images selected</p>
                 </div>
              </div>
              {config.referenceImages.length > 0 && (
                <div className="flex -space-x-3 mt-4">
                    {config.referenceImages.map((src, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                            <img src={src} className="w-full h-full object-cover" alt="ref" />
                        </div>
                    ))}
                </div>
              )}
           </section>

           <section>
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-4">Composition</h3>
             <div className="flex flex-wrap gap-2">
                {Object.values(AspectRatio).map(ratio => (
                    <button
                        key={ratio}
                        onClick={() => setConfig(prev => ({ ...prev, aspectRatio: ratio }))}
                        className={`
                            w-12 h-12 flex items-center justify-center text-[10px] font-bold border rounded-md transition-all
                            ${config.aspectRatio === ratio 
                                ? 'border-black bg-black text-white' 
                                : 'border-gray-300 text-gray-500 hover:border-black'
                            }
                        `}
                    >
                        {ratio}
                    </button>
                ))}
             </div>
           </section>

           {/* Tags - Always visible in Fast, optional in Consult */}
           <TagSelector 
                categories={TAG_CATEGORIES}
                selectedTags={{
                    style: config.style,
                    lighting: config.lighting,
                    camera: config.camera,
                    environment: config.environment,
                    pose: config.pose
                }}
                onSelect={handleTagSelect}
           />
           
           {mode === 'fast' && (
              <Button onClick={handleGenerate} fullWidth size="lg" disabled={isGenerating}>
                 {isGenerating ? 'PROCESSING...' : 'GENERATE PHOTO'}
              </Button>
           )}
        </div>

        {/* MIDDLE / RIGHT: Dynamic based on mode */}
        <div className={`lg:col-span-8 grid grid-cols-1 ${mode === 'consultation' ? 'lg:grid-cols-2 gap-8' : ''}`}>
            
            {/* Consult Mode: Chat Panel */}
            {mode === 'consultation' && (
               <div className="h-[600px]">
                   <ChatInterface 
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isProcessing={isChatProcessing}
                        onGenerate={handleGenerate}
                        readyToGenerate={true}
                    />
               </div>
            )}

            {/* Output Panel (Full width in Fast, Half in Consult) */}
            <div className={`
               bg-[#e5e5e5] rounded-3xl p-8 flex flex-col relative overflow-hidden min-h-[600px] border border-gray-300
               ${mode === 'fast' ? 'lg:col-span-8' : 'lg:col-span-1'}
            `}>
                <div className="absolute top-6 left-6 z-10">
                   <h2 className="text-xl font-black tracking-tighter">RESULT</h2>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    {isGenerating ? (
                        <div className="text-center relative">
                            {/* Loading Orb */}
                            <div className="w-32 h-32 rounded-full border-2 border-black animate-spin mb-4 flex items-center justify-center">
                                <div className="w-24 h-24 bg-black rounded-full animate-pulse"></div>
                            </div>
                            <p className="font-mono text-xs uppercase tracking-widest">Rendering Light Physics...</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center p-4">
                            <img 
                               src={generatedImage} 
                               alt="Result" 
                               className="shadow-2xl max-h-[500px] object-contain bg-white" 
                               // Apply minimal styling for ID photos to check borders
                               style={{ borderRadius: config.style.includes('ID') ? '0' : '8px' }}
                           />
                           {/* Clean Download Button */}
                           <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button size="sm" onClick={downloadImage} className="shadow-xl bg-white text-black hover:bg-gray-100">
                                   <Download size={16} className="mr-2"/> CLEAN DOWNLOAD
                                </Button>
                           </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-30">
                            <ImageIcon size={64} className="mx-auto mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Waiting for Input</p>
                        </div>
                    )}

                    {error && (
                         <div className="absolute inset-0 bg-white/95 flex items-center justify-center p-8 text-center">
                             <div>
                                <p className="font-bold text-red-600 mb-2">GENERATION ERROR</p>
                                <p className="text-sm text-gray-600 mb-4">{error}</p>
                                <Button size="sm" variant="outline" onClick={() => setError(null)}>
                                    <RotateCcw size={14} className="mr-1"/> RETRY
                                </Button>
                             </div>
                         </div>
                     )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
