import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Navigation2 } from 'lucide-react';

interface RoamioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const RoamioLogo: React.FC<RoamioLogoProps> = ({ size = 'md', onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div
      id="roamio-brand-logo"
      className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="banner"
    >
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8585] shadow-sm shadow-[#0EA5A5]/20 p-1.5 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:shadow-[#0EA5A5]/35 group-hover:scale-105`}>
        {/* Background compass dial */}
        <motion.div
          animate={{
            rotate: isHovered ? 180 : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center opacity-30 text-white"
        >
          <Compass className="w-full h-full stroke-[1.5]" />
        </motion.div>

        {/* Dynamic soaring navigation arrow / plane */}
        <motion.div
          animate={{
            rotate: isHovered ? [0, -25, 45] : 0,
            x: isHovered ? [0, 2, 0] : 0,
            y: isHovered ? [0, -3, 0] : 0,
            scale: isHovered ? 1.15 : 1
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative text-[#FF6B4A] z-10 drop-shadow-sm filter"
        >
          <Navigation2 className="w-5 h-5 fill-[#FF6B4A] stroke-white stroke-1" />
        </motion.div>

        {/* Orbit indicator spark */}
        <motion.span
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? [0.6, 1.2, 1] : 0.6
          }}
          transition={{ duration: 0.4 }}
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight text-[#1F2937] font-display ${textSizes[size]}`}>
            Roam<span className="text-[#0EA5A5]">io</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] -mb-1 animate-pulse" />
        </div>
        {size === 'lg' && (
          <span className="text-xs font-medium tracking-wider uppercase text-[#374151]/70">
            Intelligent Travel Planner
          </span>
        )}
      </div>
    </div>
  );
};
