
import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { MOCK_GALLERY } from '../constants';
import { Filter, Copy, Heart, TrendingUp, Clock } from 'lucide-react';
import { Button } from './Button';

interface GalleryProps {
  onUsePrompt: (item: GalleryItem) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onUsePrompt }) => {
  const [items, setItems] = useState<GalleryItem[]>(MOCK_GALLERY);
  const [filterStyle, setFilterStyle] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'newest'>('trending');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedIds.has(id);
    const newLikedIds = new Set(likedIds);
    if (isLiked) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }
    setLikedIds(newLikedIds);

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, likes: item.likes + (isLiked ? -1 : 1) }
        : item
    ));
  };

  const handleUse = (item: GalleryItem) => {
    // Increment usage count locally
    setItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, usageCount: i.usageCount + 1 }
        : i
    ));
    onUsePrompt(item);
  };

  // Sorting Logic
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'trending') {
      // Simple algorithm: Likes * 1 + Usage * 2
      const scoreA = a.likes + (a.usageCount * 2);
      const scoreB = b.likes + (b.usageCount * 2);
      return scoreB - scoreA;
    } else {
      // Mock newest by ID (assuming higher ID is newer)
      return parseInt(b.id) - parseInt(a.id);
    }
  });

  const filteredItems = filterStyle 
    ? sortedItems.filter(item => item.tags.style === filterStyle)
    : sortedItems;

  const allStyles = Array.from(new Set(items.map(item => item.tags.style)));

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto bg-white border-t border-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">ARCHIVE</h2>
          <p className="text-gray-500 max-w-md">
            Community curated generations. Select a style to replicate parameters.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 items-end">
            {/* Sort Controls */}
            <div className="flex bg-gray-100 rounded-full p-1">
                <button 
                    onClick={() => setSortBy('trending')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${sortBy === 'trending' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                >
                    <TrendingUp size={12}/> Trending
                </button>
                <button 
                    onClick={() => setSortBy('newest')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${sortBy === 'newest' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                >
                    <Clock size={12}/> Newest
                </button>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 justify-end">
            <Button 
                variant={filterStyle === null ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setFilterStyle(null)}
            >
                ALL
            </Button>
            {allStyles.map(style => (
                <Button
                key={style}
                variant={filterStyle === style ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStyle(style)}
                >
                {style.toUpperCase()}
                </Button>
            ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-black">
        {filteredItems.map((item) => (
          <div key={item.id} className="group relative border-r border-b border-black aspect-[3/4] overflow-hidden bg-gray-50">
            <img 
              src={item.url} 
              alt={item.prompt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Stats Overlay (Always Visible) */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <div className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Heart size={10} className={likedIds.has(item.id) ? "fill-red-500 text-red-500" : ""} /> {item.likes}
                </div>
                <div className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-bold">
                    USED {item.usageCount}
                </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                 <button 
                    onClick={(e) => handleLike(item.id, e)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full transition-colors"
                 >
                    <Heart className={`w-5 h-5 ${likedIds.has(item.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                 </button>
                 <div className="bg-white/10 backdrop-blur-md p-2 rounded-full">
                   <Copy className="w-5 h-5 text-white" />
                 </div>
              </div>
              
              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.values(item.tags).map(tag => (
                    tag && (
                        <span key={tag} className="text-[10px] font-bold uppercase bg-white text-black px-2 py-1">
                        {tag}
                        </span>
                    )
                  ))}
                </div>
                <p className="text-white text-xs line-clamp-2 mb-4 font-mono opacity-80">
                  // {item.prompt}
                </p>
                <Button 
                  fullWidth 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleUse(item)}
                  className="bg-white text-black hover:bg-gray-200 border-none"
                >
                  APPLY PARAMETERS
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
