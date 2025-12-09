import React, { useState } from 'react';
import { TagCategory } from '../types';
import { Plus } from 'lucide-react';

interface TagSelectorProps {
  categories: TagCategory[];
  selectedTags: Record<string, string>;
  onSelect: (categoryId: string, option: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ categories, selectedTags, onSelect }) => {
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const handleCustomSubmit = (categoryId: string) => {
    const val = customInputs[categoryId];
    if (val && val.trim()) {
      onSelect(categoryId, val.trim());
      setCustomInputs(prev => ({ ...prev, [categoryId]: '' }));
      setActiveInput(null);
    }
  };

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200 pb-2">
            {category.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.options.map((option) => {
              const isSelected = selectedTags[category.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => onSelect(category.id, option)}
                  className={`
                    px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 rounded-full border
                    ${isSelected 
                      ? 'bg-black text-white border-black shadow-lg transform -translate-y-0.5' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black hover:bg-gray-50'
                    }
                  `}
                >
                  {option}
                </button>
              );
            })}
            
            {/* Custom Input Tag */}
            {activeInput === category.id ? (
                <div className="flex items-center">
                    <input 
                        autoFocus
                        type="text"
                        value={customInputs[category.id] || ''}
                        onChange={(e) => setCustomInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCustomSubmit(category.id);
                            if (e.key === 'Escape') setActiveInput(null);
                        }}
                        onBlur={() => {
                            if (!customInputs[category.id]) setActiveInput(null);
                        }}
                        placeholder="Type..."
                        className="px-4 py-2 text-[11px] font-bold uppercase rounded-full border border-black text-black outline-none w-32 bg-gray-50"
                    />
                </div>
            ) : (
                <button
                  onClick={() => setActiveInput(category.id)}
                  className="px-3 py-2 text-[11px] font-bold uppercase rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> Custom
                </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};