import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ size = 'md', centered = false }) => {
  // Sizes: 'sm', 'md', 'lg'
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className="flex flex-col items-center text-center font-sans select-none w-full">
      {/* FirstCry Official Logo Image Container */}
      <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        isLg ? 'w-56 h-36' : isSm ? 'w-24 h-16' : 'w-28 h-18'
      }`}>
        <img 
          src={logoImg} 
          alt="FirstCry Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Intellitots Brand Text in grey */}
      <span className={`font-black tracking-wider uppercase font-sans text-slate-500 dark:text-slate-400 ${
        isLg ? 'text-lg -mt-4' : isSm ? 'text-[10px] -mt-2' : 'text-xs -mt-3'
      }`}>
        Intellitots
      </span>
    </div>
  );
};

export default Logo;
