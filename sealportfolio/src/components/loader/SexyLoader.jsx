import React from "react";

const SexyLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0c10] text-white overflow-hidden">
      
      {/* ✨ Golden Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-20 animate-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>

      {/* Main 3D Cube */}
      <div className="relative z-10 w-20 h-20 animate-spin3d">
        <div className="absolute w-full h-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-300 opacity-95 shadow-[0_0_30px_5px_rgba(255,215,0,0.5)] rounded-[6px] border border-yellow-300 transform rotate-12" />

        {/* Orbiting Ring */}
        <div className="absolute w-[90px] h-[90px] border border-yellow-400 rounded-full animate-orbit opacity-30 blur-[1px]">
          <div className="w-2 h-2 bg-yellow-300 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
        </div>
      </div>

      {/* Background Glowing Ring */}
      <div className="absolute z-0 w-36 h-36 rounded-full border-[6px] border-dashed border-yellow-500 animate-spin-slow opacity-30 blur-[2px]" />

      {/* Glowing Text */}
      <p className="z-10 mt-8 text-sm tracking-wider text-yellow-300 animate-pulse">
        Welcome to my Portfolio...
      </p>

      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        @keyframes spin3d {
          0%   { transform: rotateX(0deg) rotateY(0deg); }
          50%  { transform: rotateX(180deg) rotateY(180deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        .animate-spin3d {
          animation: spin3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 800px;
        }

        @keyframes orbit {
          0%   { transform: rotate(0deg) translateX(0px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(0px) rotate(-360deg); }
        }
        .animate-orbit {
          animation: orbit 3s linear infinite;
          transform-origin: center;
        }

        @keyframes particle {
          0%   { transform: translateY(0) scale(1); opacity: 0.2; }
          50%  { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0) scale(1); opacity: 0.2; }
        }
        .animate-particle {
          animation-name: particle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default SexyLoader;

