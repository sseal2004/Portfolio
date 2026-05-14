import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '../framerMotion/variant'
import CetificateText from './CertificateText'

const certificates = [
  {
    title: 'Euphoria Genx',
    date: 'Date: February 12 2025',
    image: '/image/certificates/internship.jpg',
  },
  {
    title: 'Internal Hackthon SIH 2025',
    date: 'Date: September 24 2025',
    image: '/image/certificates/sihImage.jpg',
  },
  {
    title: 'Hack-O-NiT 2024',
    date: 'Date: May 15 2024',
    image: '/image/certificates/hackonit.jpg',
  },
  {
    title: 'Paper Published 2025',
    date: 'Date: October 14 2025',
    image: '/image/certificates/ciacon.jpg',
  },
  {
    title: 'Prodigy Internship',
    date: 'Date: 31st February 2025',
    image: '/image/certificates/prodigyIntern.jpg',
  },
  {
    title: 'Programming in Java',
    date: 'Date: October 25 2025',
    image: '/image/certificates/npteljava.jpg',
  },
  {
    title: 'Object Oriented Programming',
    date: 'Date: February 12 2025',
    image: '/image/certificates/oops.jpg',
  },
  {
    title: 'PostMan Api',
    date: 'Date: June 28 2024',
    image: '/image/certificates/postMan.jpg',
  },
  {
    title: 'Compitative Programming',
    date: 'Date: June 28 2024',
    image: '/image/certificates/hackerrank.png',
  },
  

  {
    title: 'IIT kharagpur Unstop',
    date: 'Date: May 10 2023',
    image: '/image/certificates/unstop.jpg',
  },
  {
    title: 'AI-ML Virtual Internship',
    date: 'Date: September 15 2025',
    image: '/image/certificates/aimleduskill.jpg',
  }
]

const CertificateMain = () => {
  return (
    <div id='certificate' className="max-w-[1200px] mx-auto px-4">

      <motion.div variants={fadeIn('up', 0.2)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0 }}>
        <CetificateText />
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-7xl mx-auto border-2 border-black dark:border-white/60 md:p-[20px]">
        {certificates.map((cert, index) => (
          
          <motion.div key={index} variants={fadeIn('up', 0.1 * index)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
           
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-white/90 overflow-hidden h-full flex flex-col">

              <div className="relative overflow-hidden aspect-[4/3] bg-black/30">
                <img src={cert.image} alt={cert.title} className="w-full h-full object-cover"/>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/50">
                  <span className="text-sm text-orange font-medium">{cert.date}</span>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CertificateMain