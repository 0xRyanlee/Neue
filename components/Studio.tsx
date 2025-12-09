import { supabase } from '../services/supabase';

// ... (keep existing imports)

// Helper: Convert Data URI to Blob
const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
};

// ... (Interface StudioProps remains)

export const Studio: React.FC<StudioProps> = ({ initialConfig, onPublish, initialSmartInput }) => {
    // ... (keep existing state)

    // Session State
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, []);

    // ... (keep Chat/SmartInput/History state)

    // ... (keep useEffects)

    const handleSaveToSupabase = async (isPublic: boolean) => {
        const currentImage = history[viewIndex];
        if (!currentImage || !session) return;

        try {
            setIsGenerating(true); // Re-use loading state or add new one

            // 1. Upload to Storage
            const blob = dataURItoBlob(currentImage);
            const fileName = `${session.user.id}/${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
                .from('generations')
                .upload(fileName, blob);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('generations')
                .getPublicUrl(fileName);

            // 3. Insert into DB
            const { error: dbError } = await supabase
                .from('generations')
                .insert({
                    user_id: session.user.id,
                    image_url: publicUrl,
                    prompt: smartInput || "Generated Image",
                    config: config,
                    is_public: isPublic,
                    likes: 0
                });

            if (dbError) throw dbError;

            setHasPublishedCurrent(true);
            setIsPublishModalOpen(false);
            alert("Saved to Gallery!"); // Replace with Toast later

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirmPublish = (isPublic: boolean) => {
        if (session) {
            handleSaveToSupabase(isPublic);
        } else {
            // Should not happen if UI is correct, but safe guard
            supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
        }
    };

    // ... (Keep downloadImage)

    // ... (Keep render until Modal)

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Publish Modal */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white max-w-sm w-full p-6 border-2 border-black shadow-[8px_8px_0px_0px_white] relative">
                        <button onClick={() => setIsPublishModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                            <X size={20} />
                        </button>

                        {session ? (
                            <>
                                <h3 className="font-black text-xl uppercase tracking-tighter mb-2">Publish Work</h3>
                                <p className="text-sm text-gray-500 mb-6">Choose how you want to share your creation.</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleConfirmPublish(true)}
                                        className="w-full flex items-center justify-between p-4 border border-black hover:bg-black hover:text-white transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Share2 size={18} />
                                            <div className="text-left">
                                                <div className="font-bold text-sm uppercase">Public Gallery</div>
                                                <div className="text-[10px] opacity-60">Visible to everyone</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full group-hover:bg-white group-hover:text-black">
                                                Earn Credits
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleConfirmPublish(false)}
                                        className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-black transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm uppercase">Private Archive</div>
                                                <div className="text-[10px] text-gray-500">Only visible to you</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                <div className="mt-4 text-[10px] text-center text-gray-400">
                                    *Public posts with 100+ likes earn 50 free credits.
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                                <h3 className="font-black text-xl uppercase tracking-tighter mb-2">Join Neue Studio</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Sign in to save your masterpieces, earn credits, and join the global creator community.
                                </p>
                                <Button
                                    fullWidth
                                    size="lg"
                                    className="bg-black text-white"
                                    onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                                >
                                    CONNECT WITH GOOGLE
                                </Button>
                                <p className="text-[10px] text-gray-400 mt-4">
                                    It takes 5 seconds and is completely free.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Main Grid Layout */}
            {/* 
          State 1 (Initial): Content Centered (max-w-3xl)
          State 2 (Generated): Split View (grid-cols-12)
      */}
            <div className={`transition-all duration-700 ${hasGeneratedOnce ? 'grid grid-cols-1 lg:grid-cols-12 gap-8' : 'max-w-3xl mx-auto'}`}>

                {/* LEFT COLUMN: Controls */}
                <div className={`${hasGeneratedOnce ? 'lg:col-span-4' : 'w-full'} space-y-8`}>

                    {/* Vision Input + Mode Toggle (Combined) */}
                    <section className="bg-white p-1 rounded-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-black pl-2">
                                Vision & Context
                            </h3>
                            {/* Integrated Mode Switcher */}
                            <div className="bg-gray-100 p-0.5 rounded-lg flex">
                                <button
                                    onClick={() => setMode('fast')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${mode === 'fast' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Fast
                                </button>
                                <button
                                    onClick={() => setMode('consultation')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${mode === 'consultation' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Consult
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                placeholder={mode === 'fast'
                                    ? "Describe your vision (e.g., 'Sad cyberpunk detective in rain')..."
                                    : "Chat with the AI Photographer to refine your shot..."
                                }
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-1 focus:ring-black min-h-[100px] resize-none"
                            />

                            {mode === 'fast' && (
                                <Button
                                    onClick={handleSmartAnalyze}
                                    size="sm"
                                    disabled={!smartInput || isAnalyzing}
                                    className="mt-2 w-full bg-white border border-gray-300 text-black hover:bg-gray-50 text-xs py-2"
                                >
                                    {isAnalyzing ? (
                                        <span className="animate-pulse">ANALYZING...</span>
                                    ) : (
                                        <span className="flex items-center justify-center"><Wand2 size={12} className="mr-2" /> AUTO-CONFIGURE TAGS</span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </section>

                    {/* Input Source / Upload (Centered) */}
                    <section className="flex flex-col items-center justify-center py-6 border-y border-gray-100">
                        <div className="relative w-16 h-16 rounded-full border border-dashed border-gray-400 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer group mb-3">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="text-gray-400 group-hover:text-black transition-colors w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Upload Reference</p>
                        <p className="text-[10px] text-gray-400 mt-1">{config.referenceImages.length} selected</p>

                        {config.referenceImages.length > 0 && (
                            <div className="flex gap-2 mt-4 justify-center">
                                {config.referenceImages.map((src, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                                        <img src={src} className="w-full h-full object-cover" alt="ref" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Model Tier Selector (Compact) */}
                    <section className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, modelTier: ModelTier.STANDARD }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${config.modelTier === ModelTier.STANDARD ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider">Standard</span>
                        </button>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, modelTier: ModelTier.PRO }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${config.modelTier === ModelTier.PRO ? 'bg-white border-black text-black shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">Pro <Crown size={10} /></span>
                        </button>
                    </section>

                    {/* Config Sections */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200 pb-2 mb-4">Composition</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(AspectRatio).map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setConfig(prev => ({ ...prev, aspectRatio: ratio }))}
                                    className={`
                            px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all
                            ${config.aspectRatio === ratio
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-black'
                                        }
                        `}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Tags */}
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
                        <div className="sticky bottom-6 pt-4 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5] to-transparent">
                            <Button onClick={handleGenerate} fullWidth size="lg" disabled={isGenerating} className="shadow-2xl">
                                {isGenerating ? 'PROCESSING...' : 'GENERATE PHOTO'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* MIDDLE / RIGHT: Results or Chat */}
                {hasGeneratedOnce && (
                    <div className={`lg:col-span-8 grid grid-cols-1 ${mode === 'consultation' ? 'lg:grid-cols-2 gap-6' : ''} animate-in fade-in slide-in-from-bottom-10 duration-700`}>

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

                        {/* Output Panel */}
                        <div className={`
                bg-white rounded-none border-2 border-black p-0 flex flex-col relative overflow-hidden h-[700px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
                ${mode === 'fast' ? 'lg:col-span-8' : 'lg:col-span-1'}
                `}>
                            {/* Header */}
                            <div className="h-12 border-b-2 border-black bg-gray-50 flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className="font-mono text-xs uppercase font-bold">Output Monitor</span>
                                </div>
                                <div className="font-mono text-xs">
                                    {viewIndex + 1} / {history.length}
                                </div>
                            </div>

                            {/* Main Image Viewport */}
                            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 flex items-center justify-center relative overflow-hidden group">
                                {isGenerating ? (
                                    <div className="text-center relative z-10">
                                        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="font-mono text-xs font-bold uppercase tracking-widest bg-white px-2 py-1">Developing...</p>
                                    </div>
                                ) : currentImage ? (
                                    <>
                                        <img
                                            src={currentImage}
                                            alt="Result"
                                            className="max-w-full max-h-full object-contain shadow-2xl"
                                        />
                                        {/* Overlay Actions */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button size="sm" onClick={() => setIsPublishModalOpen(true)} className="bg-white text-black hover:bg-gray-200 border-none shadow-xl">
                                                <Share2 size={14} className="mr-2" /> {hasPublishedCurrent ? 'PUBLISHED' : 'PUBLISH'}
                                            </Button>
                                            <Button size="sm" onClick={downloadImage} className="bg-black text-white hover:bg-gray-800 shadow-xl border-none">
                                                <Download size={14} className="mr-2" /> SAVE
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 font-mono text-xs">NO SIGNAL</div>
                                )}

                                {error && (
                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                                        <div className="text-center text-red-600 font-mono text-sm px-8">
                                            ERROR: {error}
                                            <button onClick={() => setError(null)} className="block mt-4 mx-auto underline">Dismiss</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gacha Strip (History) */}
                            <div className="h-24 bg-black border-t-2 border-black p-2 flex gap-2 overflow-x-auto items-center">
                                <div className="flex-shrink-0 text-white writing-vertical text-[9px] font-mono tracking-widest opacity-50 px-1 border-r border-gray-800 h-full flex items-center">
                                    HISTORY
                                </div>
                                {history.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setViewIndex(idx)}
                                        className={`
                                    relative h-full aspect-[3/4] cursor-pointer transition-all border-2
                                    ${viewIndex === idx ? 'border-white opacity-100 scale-105 z-10' : 'border-transparent opacity-40 hover:opacity-80'}
                                `}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute top-0 right-0 bg-black text-white text-[8px] px-1 font-mono">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};