import React, { useState } from 'react';

interface CoopLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const CoopLogo: React.FC<CoopLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeMap[size]} shrink-0 rounded-full bg-white shadow-xs flex items-center justify-center border-2 border-emerald-600/30 p-0.5 overflow-hidden group hover:scale-105 transition-transform duration-300`}
      >
        {!imgError ? (
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="ตราสหกรณ์การเกษตรเชียงยืน จำกัด"
            className="w-full h-full object-contain rounded-full"
            onError={() => setImgError(true)}
          />
        ) : (
          /* SVG Fallback */
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rainbowGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E63946" />
                <stop offset="25%" stopColor="#FB8500" />
                <stop offset="50%" stopColor="#FFB703" />
                <stop offset="75%" stopColor="#2A9D8F" />
                <stop offset="100%" stopColor="#1D3557" />
              </linearGradient>
              <linearGradient id="blueStepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1B3B6F" />
                <stop offset="100%" stopColor="#062758" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="96" fill="#FFFFFF" />
            <path
              d="M 120 16 A 84 84 0 0 1 184 100 A 84 84 0 0 1 100 184 A 84 84 0 0 1 45 168"
              fill="none"
              stroke="url(#rainbowGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 45 168 A 84 84 0 0 1 16 100 A 84 84 0 0 1 100 16 A 84 84 0 0 1 120 16"
              fill="none"
              stroke="#1B3B6F"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <g fill="url(#blueStepGrad)">
              <path d="M 125 35 L 145 35 L 145 55 L 125 55 Z" rx="2" />
              <rect x="105" y="55" width="80" height="22" rx="11" />
              <rect x="75" y="80" width="70" height="22" rx="11" />
              <rect x="55" y="105" width="70" height="22" rx="11" />
              <rect x="15" y="130" width="80" height="22" rx="11" />
              <rect x="55" y="130" width="22" height="42" rx="8" />
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-base md:text-lg text-[#005B35] leading-tight">
            สหกรณ์การเกษตรเชียงยืน จำกัด
          </span>
          <span className="text-xs text-amber-600 font-medium tracking-wide">
            Chiang Yuen Agricultural Cooperative Limited
          </span>
        </div>
      )}
    </div>
  );
};
