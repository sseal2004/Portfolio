import React, { useState, useEffect } from 'react';
import {motion} from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';

const roles = [
  "FrontEnd Developer.",
  "Backend Developer.",  
  "MERN Developer.",
  "Android Developer.",
  "AI & ML Enthusiast.",
  "Cloud CRM Developer.",
  "Software Developer."
];

const TitleLooper = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentRole = roles[roleIndex];

    if (charIndex < currentRole.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentRole[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      const pauseBeforeNext = setTimeout(() => {
        setCharIndex(0);
        setDisplayedText('');
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }, 2500);
      return () => clearTimeout(pauseBeforeNext);
    }
  }, [charIndex, roleIndex]);

  return (
    <div className='custom-responsive-wrap'> 
    <motion.h2 
    variants={fadeIn('right',0.4)}
      initial='hidden'
      whileInView='show'
      viewport={{once: false,amount:0}}
    
    className="text-xl sm:text-3xl md:text-4xl lg:text-4xl font-bold  text-center transition-all duration-500">
      I am a{" "}
      <span
        className="
          bg-gradient-to-r from-fuchsia via-rose to-orange
dark:from-[#00c9ff] dark:via-[#92fe9d] dark:to-[#00c9ff]
          bg-clip-text text-transparent 
          drop-shadow-[0_1px_3px_rgba(255,105,180,0.7)]
          dark:drop-shadow-[0_1px_6px_rgba(255,165,0,0.5)]
          border-r-2 border-pink-400 animate-none "
      >
        {displayedText}
      </span>
    </motion.h2>
    </div>
  );
};

export default TitleLooper;


