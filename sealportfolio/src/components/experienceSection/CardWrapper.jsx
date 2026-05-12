import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const MAX_ROTATE = 100;
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const CardWrapper = ({ children, borderColor }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-50, 50], [MAX_ROTATE, -MAX_ROTATE]);
  const rotateY = useTransform(x, [-50, 50], [-MAX_ROTATE, MAX_ROTATE]);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left - rect.width / 2;
    const yPos = e.clientY - rect.top - rect.height / 2;
    x.set(xPos / 5);
    y.set(yPos / 5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
        cursor: 'url(/cursor-pointer.png), pointer',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-300"
    >
      <div
  className={`relative overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-lg border ${borderColor} rounded-2xl p-6 shadow-lg 
    hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] 
    dark:hover:shadow-[0_0_25px_rgba(240,169,79,0.5)]`}
    >
        {/* Optional inner highlight — disabled for now */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-700/10 to-purple-400/10 pointer-events-none" /> */}

        {children}
      </div>
    </motion.div>
  );
};

export default CardWrapper;
