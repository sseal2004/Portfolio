import React from 'react';
import { GiNestedHexagons } from "react-icons/gi";
import { motion } from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';


const HeroPic = () => {
  return (
    <motion.div 
     variants={fadeIn('left', 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0 }}
    className="h-full flex items-center justify-center relative">
      {/* Light Mode Image */}
      <img
        // src="/image/pic.png"
        src="/image/pic2.png"
        alt="mypic"
        className="max-h-[390px] w-auto dark:hidden"
      />

      {/* Dark Mode Image */}
      <img
      src="/image/pic.png"
        // src="/image/pic2.png"  // 🔁 Change this path to your dark mode image
        alt="mypic-dark"
        className="max-h-[390px] w-auto hidden dark:block"
      />

      {/* Animated Hexagon */}
      <div className="absolute -z-10 flex justify-center items-center animate-pulse">
        <GiNestedHexagons
          className="md:h-[90%] sm:h-[120%] min-h-[600px] w-auto 
                     text-fuchsia dark:text-cyan 
                     blur-md animate-[spin_20s_linear_infinite]"
        />
      </div>
    </motion.div>
  );
};

export default HeroPic;

