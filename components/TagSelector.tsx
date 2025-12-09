import React from 'react';
import { TagCategory } from '../types';

interface TagSelectorProps {
  categories: TagCategory[];
  selectedTags: Record<string, string>;
  onSelect: (categoryId: string, option: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ categories, selectedTags, onSelect }) => {
  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">
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
                    px-3 py-1.5 text-xs font-medium border transition-all duration-200 rounded-sm
                    ${isSelected 
                      ? 'bg-black text-white border-black transform -translate-y-0.5 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black'
                    }
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};