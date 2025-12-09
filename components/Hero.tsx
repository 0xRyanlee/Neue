import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#f5f5f5] text-black py-20 md:py-32">
      {/* Background Grid */}
      <div className="swiss-grid absolute inset-0 opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Typography */}
        <div>
          <div className="mb-6 inline-block px-3 py-1 border border-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
            Beta 2.0 // Gemini 3 Pro
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8]">
            DIGITAL<br/>
            SALON
          </h1>
          <p className="mt-8 text-xl md:text-2xl font-medium leading-snug max-w-md text-gray-800">
            Professional grade AI photography. 
            Replicable results. Pure minimalist output.
          </p>
        </div>

        {/* Right: Abstract Orb (World App Vibe) */}
        <div className="flex justify-center lg:justify-end relative">
           {/* Outer Ring */}
           <div className="w-64 h-64 md:w-96 md:h-96 border-[1px] border-black rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
              {/* Inner Elements */}
              <div className="w-[90%] h-[90%] border-[1px] border-gray-300 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
           </div>
           
           {/* Floating Orb */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-black to-gray-600 rounded-full shadow-2xl mix-blend-multiply opacity-90"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-32 h-32 bg-blue-600 rounded-full blur-2xl opacity-40 mix-blend-overlay"></div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-6 md:left-auto md:right-12 animate-bounce">
         <ArrowDown size={24} />
      </div>
    </div>
  );
};