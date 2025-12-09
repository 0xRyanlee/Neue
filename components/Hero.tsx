import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#f5f5f5] text-black py-10 md:py-16 border-b border-black">
      {/* Background Grid */}
      <div className="swiss-grid absolute inset-0 opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Typography */}
        <div>
          <div className="mb-3 inline-block px-2 py-0.5 border border-black rounded-full text-[8px] font-bold uppercase tracking-[0.2em]">
            Beta 2.0 // Gemini 3 Pro
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">
            DIGITAL<br/>
            SALON
          </h1>
          <p className="mt-4 text-sm md:text-base font-medium leading-snug max-w-sm text-gray-800">
            Professional grade AI photography simulation. 
            Pure minimalist output.
          </p>
        </div>

        {/* Right: Abstract Orb (Compact) */}
        <div className="flex justify-start md:justify-end relative h-32 md:h-auto">
           {/* Outer Ring */}
           <div className="w-32 h-32 md:w-48 md:h-48 border-[1px] border-black rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
              {/* Inner Elements */}
              <div className="w-[90%] h-[90%] border-[1px] border-gray-300 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
           </div>
           
           {/* Floating Orb */}
           <div className="absolute top-1/2 left-16 md:left-auto md:right-24 -translate-y-1/2 w-24 h-24 bg-gradient-to-tr from-black to-gray-600 rounded-full shadow-xl mix-blend-multiply opacity-90"></div>
           <div className="absolute top-1/2 left-20 md:left-auto md:right-20 -translate-y-1/3 w-16 h-16 bg-blue-600 rounded-full blur-xl opacity-40 mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  );
};