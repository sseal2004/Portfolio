import React from 'react'
import { motion } from 'framer-motion';
import { fadeIn } from '../framerMotion/variant';




const ProjectText = () => {
  return (
    <div className='flex flex-col items-center mt-[100px]'>
<motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 
        bg-gradient-to-r from-rose via-darkOrange to-orange 
        dark:bg-gradient-to-t dark:from-white dark:via-orange dark:to-white 
        text-transparent bg-clip-text tracking-tight
        animate-fade-in-down"
        
        variants={fadeIn('right', 0.2)}
                                  initial="hidden"
                                  whileInView="show"
                                  viewport={{ once: false, amount: 0.3 }}>
  Projects
</motion.h2>
        <motion.p 
        variants={fadeIn('up', 0)}
                                  initial="hidden"
                                  whileInView="show"
                                  viewport={{ once: false, amount: 0.2 }}
        className='text-lg text-center'>I have worked on a diverse range of projects, including web development, app development, and software solutions — from building responsive websites for small businesses to developing full-stack applications with complex logic. My experience covers crafting seamless, user-friendly interfaces and architecting scalable systems tailored to meet advanced client requirements</motion.p>
    </div>
  )
}

export default ProjectText