import React from 'react';
import AboutMeText from './AboutMeText';
import AboutMeImage from './AboutMeImage';
import { motion } from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';


const AboutMeMain = () => {
  return (
    <div id='about' className="flex flex-col md:flex-row gap-12 px-4 max-w-[1200px] mx-auto mt-[80px] justify-center items-center text-center md:text-left ">
      <motion.div 
       variants={fadeIn('right', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.7 }}
      className="w-full md:w-1/2">
        <AboutMeText />
      </motion.div>
      <motion.div 
       variants={fadeIn('left', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.7 }}
      className="w-full md:w-1/2 flex justify-center">
        <AboutMeImage />
      </motion.div>
    </div>
  );
};

export default AboutMeMain;
