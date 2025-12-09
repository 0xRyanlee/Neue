import React, { useState, useEffect } from 'react';
import { Heart, Share2, Wand2 } from 'lucide-react';
import { Button } from './Button';
import { GalleryItem } from '../types';
import { supabase } from '../services/supabase';

interface GalleryProps {
  onUsePrompt?: (prompt: string, config?: any) => void;
  compact?: boolean;
}

export const Gallery: React.FC<GalleryProps> = ({ onUsePrompt, compact = false }) => {
  const [filter, setFilter] = useState('trending');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserLikes(session.user.id);
    });
  }, []);

  const fetchUserLikes = async (userId: string) => {
    const { data } = await supabase.from('likes').select('generation_id').eq('user_id', userId);
    if (data) {
      setLikedItems(new Set(data.map((l: any) => l.generation_id)));
    }
  };

  const handleLike = async (generationId: string, currentCount: number) => {
    if (!session) {
      alert("Please login to like images.");
      return;
    }

    const isLiked = likedItems.has(generationId);
    const newLiked = new Set(likedItems);

    // Optimistic Update
    if (isLiked) {
      newLiked.delete(generationId);
    } else {
      newLiked.add(generationId);
    }
    setLikedItems(newLiked);

    try {
      if (isLiked) {
        await supabase.from('likes').delete().match({ user_id: session.user.id, generation_id: generationId });
      } else {
        await supabase.from('likes').insert({ user_id: session.user.id, generation_id: generationId });
      }
    } catch (err) {
      console.error("Like failed", err);
      // Revert if needed, MVP ignores revert
    }
  };

  const handleShare = async (item: GalleryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neue Studio',
          text: `Check out this AI generation: ${item.prompt}`,
          url: item.url
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(item.url);
      alert("Image URL copied to clipboard!");
    }
  };

  const handleRemixClick = async (item: GalleryItem) => {
    if (onUsePrompt) {
      onUsePrompt(item.prompt, item.config);
      // Fire and forget usage increment
      supabase.rpc('increment_usage', { row_id: item.id });
    }
  };

  // Fetch Real Data
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          const mappedItems: GalleryItem[] = data.map((item: any) => ({
            id: item.id,
            url: item.image_url,
            prompt: item.prompt,
            author: item.user_id ? 'User ' + item.user_id.slice(0, 4) : 'Anonymous',
            likes: item.likes_count || 0,
            usageCount: item.usage_count || 0,
            tags: [item.config?.style || 'Style', item.config?.lighting || 'Light'],
            config: item.config
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [filter]);

  return (
    <div className={`max-w-7xl mx-auto px-6 ${compact ? 'py-4' : 'py-12'}`}>

      {!compact && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">COMMUNITY FEED</h2>
            <p className="text-gray-500 font-mono text-sm">Curated generations from the Neue collective.</p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'trending' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}
            >
              Trending
            </button>
            <button
              onClick={() => setFilter('newest')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'newest' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}
            >
              Newest
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <div className="mb-4 text-4xl">📭</div>
          <p className="font-mono text-xs uppercase">No images yet. Be the first to publish!</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}>
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white border-2 border-transparent hover:border-black transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {/* Image Container */}
              <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay Prompt */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                  <p className="text-xs font-medium line-clamp-3 mb-4">{item.prompt}</p>

                  {onUsePrompt && (
                    <Button
                      size="sm"
                      onClick={() => handleRemixClick(item)}
                      className="w-full bg-white text-black hover:bg-gray-200 border-none"
                    >
                      <Wand2 size={14} className="mr-2" /> REMIX THIS
                    </Button>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400"></div>
                    <span className="text-xs font-bold truncate max-w-[100px]">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <button
                      onClick={() => handleLike(item.id, item.likes)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors group/like"
                    >
                      <Heart size={14} className={likedItems.has(item.id) ? "fill-red-500 text-red-500" : "group-hover/like:text-red-500"} />
                      <span className="text-[10px] font-mono">{likedItems.has(item.id) ? item.likes + 1 : item.likes}</span>
                    </button>
                    <button onClick={() => handleShare(item)} className="hover:text-black transition-colors">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
