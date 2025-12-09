
import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { Copy, Heart, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface GalleryProps {
  items: GalleryItem[];
  onUsePrompt: (item: GalleryItem) => void;
  onToggleLike: (id: string) => void;
  likedIds: Set<string>;
  compact?: boolean; // New prop for "Preview" mode on main page
}

export const Gallery: React.FC<GalleryProps> = ({ 
  items, 
  onUsePrompt, 
  onToggleLike, 
  likedIds,
  compact = false 
}) => {
  const [filterStyle, setFilterStyle] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'newest'>('trending');

  // Sorting Logic
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'trending') {
      // Simple algorithm: Likes * 1 + Usage * 2
      const scoreA = a.likes + (a.usageCount * 2);
      const scoreB = b.likes + (b.usageCount * 2);
      return scoreB - scoreA;
    } else {
      // Sort by mock numeric ID for now (assuming higher is newer)
      return parseInt(b.id) - parseInt(a.id);
    }
  });

  const filteredItems = filterStyle 
    ? sortedItems.filter(item => item.tags.style === filterStyle)
    : sortedItems;

  const displayItems = compact ? filteredItems.slice(0, 4) : filteredItems;
  const allStyles = Array.from(new Set(items.map(item => item.tags.style)));

  return (
    <section className={`px-6 max-w-7xl mx-auto bg-white ${compact ? 'py-12' : 'py-20 border-t border-black'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          {compact ? (
             <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                COMMUNITY ARCHIVE <span className="text-gray-300 text-lg font-normal">// LATEST</span>
             </h2>
          ) : (
             <>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">ARCHIVE</h2>
                <p className="text-gray-500 max-w-md">
                    Community curated generations. Select a style to replicate parameters.
                </p>
             </>
          )}
        </div>
        
        <div className="flex flex-col gap-4 items-end">
            {/* Sort Controls (Hidden in compact mode to save space, or simplified) */}
            {!compact && (
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
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                    variant={filterStyle === null ? 'primary' : 'outline'} 
                    size="sm" 
                    onClick={() => setFilterStyle(null)}
                    className="text-[10px] px-3 py-1 h-auto"
                >
                    ALL
                </Button>
                {allStyles.slice(0, compact ? 5 : undefined).map(style => (
                    <Button
                    key={style}
                    variant={filterStyle === style ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStyle(style)}
                    className="text-[10px] px-3 py-1 h-auto"
                    >
                    {style.toUpperCase()}
                    </Button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-black">
        {displayItems.map((item) => (
          <div key={item.id} className="group relative border-r border-b border-black aspect-[3/4] overflow-hidden bg-gray-50">
            <img 
              src={item.url} 
              alt={item.prompt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Stats Overlay (Always Visible) */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
                <div className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                    <Heart size={8} className={likedIds.has(item.id) ? "fill-red-500 text-red-500" : ""} /> {item.likes}
                </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(item.id); }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-1.5 rounded-full transition-colors"
                 >
                    <Heart className={`w-4 h-4 ${likedIds.has(item.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                 </button>
              </div>
              
              <div>
                <p className="text-white text-[10px] line-clamp-2 mb-3 font-mono opacity-80 leading-tight">
                  {item.prompt}
                </p>
                <Button 
                  fullWidth 
                  variant="primary" 
                  size="sm"
                  onClick={() => onUsePrompt(item)}
                  className="bg-white text-black hover:bg-gray-200 border-none text-[10px] py-2"
                >
                  USE STYLE
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* 'See More' block for compact mode */}
        {compact && (
             <div className="flex flex-col items-center justify-center border-r border-b border-black aspect-[3/4] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                 <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:scale-110 transition-transform bg-white">
                    <ChevronRight size={24} />
                 </div>
                 <span className="mt-4 font-bold text-xs uppercase tracking-widest">View All</span>
             </div>
        )}
      </div>
    </section>
  );
};
