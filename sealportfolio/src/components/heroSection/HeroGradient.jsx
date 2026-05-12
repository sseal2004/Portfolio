import React from 'react';

const HeroGradient = () => {
  return (
    <div>
      {/* Top right cyan pulse (Dark mode) */}
      <div className="dark:shadow-cyanMediumShawdow shadow-lightPinkGlow absolute top-0 right-[400px] -z-10 animate-pulse"></div>

      {/* Top right orange pulse (Dark mode) */}
      <div className="dark:shadow-orangeMediumShawdow shadow-lightYellowGlow absolute top-0 right-0 -z-10 animate-pulse"></div>
{/* Mid left cyan glow circle (Dark mode) */}
<div className="absolute top-[300px] left-0 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-50 blur-[80px] dark:bg-cyan-400 bg-blue-300" />

{/* Bottom left orange glow circle (Dark mode) */}
<div className="absolute top-[500px] left-0 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-50 blur-[80px] dark:bg-orange-400 bg-orange-200" />
    </div>
  );
};

export default HeroGradient;
