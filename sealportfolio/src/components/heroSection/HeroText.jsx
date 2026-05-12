import React from 'react';
import TitleLooper from './TitleLooper';
import { motion } from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';

const HeroText = () => {
  return (
    <section className="flex items-center justify-center min-h-screen px-4 sm:px-6">
      <div
        className="flex flex-col gap-6 
        w-full max-w-5xl 
        text-center lg:text-left 
        items-center lg:items-start"
      >
        {/* Subheading - h2 */}
        <motion.h2
          variants={fadeIn('down', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold 
          text-transparent bg-clip-text 
          bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364]
          dark:from-[#e0c3fc] dark:via-[#8ec5fc] dark:to-[#e0c3fc] 
          drop-shadow-[0_3px_20px_rgba(138,43,226,0.5)] 
          dark:drop-shadow-[0_2px_14px_rgba(255,105,180,0.4)] 
          animate-fadeIn break-words"
        >
          Welcome to My Portfolio.
        </motion.h2>

        {/* Animated Roles */}
        <TitleLooper />

        {/* Main Title - h1 */}
        <motion.h1
          variants={fadeIn('up', 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
          font-[Playfair_Display] 
          text-transparent bg-clip-text 
          bg-gradient-to-r from-[#e52d27] via-[#ff6a00] to-[#ff9472]
          dark:from-[#00c9ff] dark:via-[#92fe9d] dark:to-[#fcb045] 
          drop-shadow-[0_3px_12px_rgba(0,0,0,0.3)] 
          dark:drop-shadow-[0_3px_18px_rgba(255,255,255,0.1)] 
          animate-fadeIn"
        >
          <span className="block sm:inline whitespace-nowrap break-words">
            SOUMYADIPTA SEAL
          </span>
        </motion.h1>
      </div>
    </section>
  );
};

export default HeroText;


