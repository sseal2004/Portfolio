import React from 'react';
import AboutMeText from './AboutMeText';
import AboutMeImage from './AboutMeImage';
import { motion } from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';

const AboutMeMain = () => {
  return (
    <div
      id="about"
      className="flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 lg:gap-16 px-4 sm:px-6 md:px-8 w-full max-w-[1200px] mx-auto pt-24 sm:pt-28 md:pt-32 lg:pt-24 pb-12 scroll-mt-24 justify-center items-center text-center lg:text-left"
    >
      <motion.div
        variants={fadeIn('right', 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="w-full lg:w-1/2"
      >
        <AboutMeText />
      </motion.div>
      <motion.div
        variants={fadeIn('left', 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="w-full lg:w-1/2 flex justify-center"
      >
        <AboutMeImage />
      </motion.div>
    </div>
  );
};

export default AboutMeMain;