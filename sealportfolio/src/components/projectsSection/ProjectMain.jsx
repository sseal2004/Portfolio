import React from 'react'
import ProjectText from './ProjectText'
import { motion } from 'framer-motion'
import { fadeIn } from '../framerMotion/variant.js'


const projects = [
  {
    name: 'MedCare - Real Time Doctor-Appointment ',
    image: '/image/project/doctor.png',
    link: 'https://medcare-main.vercel.app/',
    sourcecode: 'https://github.com/sseal2004/Doctors_Appointment'
  },
  {
    name: 'Auron Blog (Real Time Blogging Website)',
    image: '/image/project/blog.png',
    sourcecode: 'https://github.com/sseal2004/Blog_App',
    link: 'https://blog-app-f2dn.onrender.com/'
  },
  {
    name: 'LpgIot (AI-Powered Smart LPG Monitoring)',
    image: '/image/project/lpg.png',
    link: 'https://lpg-dun.vercel.app/',
    sourcecode: 'https://github.com/LPG-HackONit'
  },
  {
    name: 'Auron Chat (Real Time Chatting App And AI Assistant.)',
    image: '/image/project/chat1.png',
    link: 'https://chat-buddies.vercel.app/',
    sourcecode: 'https://chat-app-x2ht.onrender.com/'
  },
  {
    name: 'Krishi Predict(A real time E-commerce Crop Yield App)',
    image: '/image/project/crop.png',
    link: 'https://krishi-predict-ji23.vercel.app/',
    sourcecode: 'https://github.com/sseal2004/KrishiPredict'
  },
      
  {
    name: 'Real time AI- Weather Forecast App',
    image: '/image/project/weather.png',
    link: 'https://weather-app-woad-eight-36.vercel.app/',
    sourcecode: 'https://github.com/sseal2004/Weather_App'
  },
  

  
]

const ProjectMain = () => {
  return (
    <div id='projects' className="max-w-[1200px] mx-auto px-4">
      <motion.div variants={fadeIn('up', 0.2)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0 }}>
        <ProjectText />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-7xl mx-auto border-2 border-black dark:border-white/60 md:p-[20px]">
        {projects.map((project, index) => (
          <motion.div key={index} variants={fadeIn('up', 0.1 * index)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-white/90 overflow-hidden h-full flex flex-col">
              
              <div className="relative overflow-hidden aspect-[4/3] bg-black/30">
                <img src={project.image} alt={project.name} className="w-full h-full object-contain"/>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                
                <h3 className="text-xl font-bold text-white mb-4">{project.name}</h3>
                
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/50">
                  
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2 bg-orange/80 hover:bg-orange text-white rounded-lg transition-colors duration-300 text-sm font-medium" >Live Demo</a>
                  
                  <a href={project.sourcecode} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2 border border-white/60 hover:bg-white/10 text-white rounded-lg transition-colors duration-300 text-sm font-medium">Source Code</a>

                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProjectMain