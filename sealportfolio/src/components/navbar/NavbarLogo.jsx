import React from 'react';

const NavbarLogo = () => {
  return (
    <div className="cursor-pointer transition-all duration-300 hover:scale-105 whitespace-nowrap">
      {/* Full name visible only above 1267px */}
      <h1
        className="hidden [@media(min-width:1268px)]:block text-3xl font-extrabold 
          bg-clip-text text-transparent 
          bg-gradient-to-r 
          from-orange via-pink to-purple
          dark:from-yellow-400 dark:via-fuchsia dark:to-indigo
          drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] 
          dark:drop-shadow-[0_1px_10px_rgba(255,255,255,0.1)] 
          hover:drop-shadow-[0_1px_10px_rgba(255,105,180,0.4)] 
          dark:hover:drop-shadow-[0_1px_16px_rgba(255,105,180,0.7)]"
      >
        Soumyadipta Seal
      </h1>

      {/* Initials (SS) visible below 1267px */}
      <h1
        className="block [@media(min-width:1268px)]:hidden font-special font-extrabold text-3xl 
          bg-clip-text text-transparent 
          bg-gradient-to-r 
          from-orange via-pink to-purple
          dark:from-yellow-400 dark:via-fuchsia dark:to-indigo
          drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] 
          dark:drop-shadow-[0_1px_10px_rgba(255,255,255,0.1)] 
          hover:drop-shadow-[0_1px_10px_rgba(255,105,180,0.4)] 
          dark:hover:drop-shadow-[0_1px_16px_rgba(255,105,180,0.7)]"
      >
        SS
      </h1>
    </div>
  );
};

export default NavbarLogo;



