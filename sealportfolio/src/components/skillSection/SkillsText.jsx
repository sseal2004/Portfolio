import React from 'react';

const SkillsText = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-28 px-4 text-center">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 
        bg-gradient-to-r from-rose via-darkOrange to-orange 
        dark:bg-gradient-to-t dark:from-white dark:via-orange dark:to-white 
        text-transparent bg-clip-text tracking-tight
        animate-fade-in-down"
      >
        Skills
      </h1>
      <p
        className="max-w-3xl text-lg sm:text-lg md:text-xl font-medium 
        bg-gradient-to-r from-darkOrange via-orange to-rose 
        text-transparent bg-clip-text leading-relaxed
        dark:bg-gradient-to-t dark:from-white dark:via-cyan dark:to-white
        animate-fade-in-up delay-200"
      >
        These technologies aren't just tools I use — I master them with best practices to build high-quality, purpose-driven portfolio projects.
      </p>
    </div>
  );
};

export default SkillsText;

