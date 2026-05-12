import React from 'react';
import {
  FaReact, FaJs, FaNodeJs, FaGitAlt, FaDocker,
} from 'react-icons/fa';
import {
  SiTailwindcss, SiNextdotjs, SiSass, SiDjango, SiExpress, SiApollographql,
  SiFlask, SiPostgresql, SiMongodb, SiMysql, SiGraphql, SiRedux, SiPrisma,
  SiHtml5, SiCss3, SiTypescript, SiGo, SiCplusplus, SiKubernetes, SiTensorflow,
  SiPytorch, SiScikitlearn, SiOpencv, SiFirebase,
} from 'react-icons/si';
import { TbSql } from 'react-icons/tb';
import { GiArtificialIntelligence } from 'react-icons/gi';

const skills = [
  {
    title: 'Frontend',
    items: [
      { icon: <FaReact />, name: 'React' },
      { icon: <SiNextdotjs />, name: 'Next.js' },
      { icon: <SiTailwindcss />, name: 'Tailwind' },
      { icon: <SiSass />, name: 'Sass/SCSS' },
      { icon: <FaJs />, name: 'JavaScript' },
      { icon: <SiTypescript />, name: 'TypeScript' },
      { icon: <SiHtml5 />, name: 'HTML5' },
      { icon: <SiCss3 />, name: 'CSS3' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { icon: <FaNodeJs />, name: 'Node.js' },
      { icon: <SiExpress />, name: 'Express.js' },
      { icon: <SiDjango />, name: 'Django' },
      { icon: <SiFlask />, name: 'Flask' },
      { icon: <SiApollographql />, name: 'API' },
      { icon: <SiGraphql />, name: 'GraphQL' },
    ],
  },
  {
    title: 'Database',
    items: [
      { icon: <SiMongodb />, name: 'MongoDB' },
      { icon: <SiPostgresql />, name: 'PostgreSQL' },
      { icon: <TbSql />, name: 'SQL' },
      { icon: <SiFirebase />, name: 'Firebase' },
      { icon: <SiPrisma />, name: 'Prisma' },
    ],
  },
  {
    title: 'Machine Learning',
    items: [
      { icon: <SiTensorflow />, name: 'TensorFlow' },
      { icon: <SiPytorch />, name: 'PyTorch' },
      { icon: <SiScikitlearn />, name: 'Scikit-Learn' },
      { icon: <GiArtificialIntelligence />, name: 'AI' },
      { icon: <SiOpencv />, name: 'OpenCV' },
    ],
  },
  {
    title: 'DevOps & Languages',
    items: [
      { icon: <FaGitAlt />, name: 'Git' },
      { icon: <FaDocker />, name: 'Docker' },
      { icon: <SiGo />, name: 'Go' },
      { icon: <SiCplusplus />, name: 'C++' },
      { icon: <SiKubernetes />, name: 'Kubernetes' },
    ],
  },
];

const AllSkills = () => {
  return (
<div
  className="w-full min-h-screen flex items-center justify-center 
             backdrop-blur-sm 
             bg-white/60 dark:bg-black/30
             mt-[10px]"
>
  <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8 border border-orange dark:border-cyan rounded-2xl">
        <div className="w-full flex flex-col gap-10">
          {skills.map((section, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-darkblue dark:text-cyan mb-6 border-b border-orange dark:border-cyan pb-2">
                {section.title}
              </h2>
              <div className="flex flex-wrap gap-6 text-cyan-400 text-4xl">
                {section.items.map((skill, index) => (
                  <div
                    key={index}
                    className=" hover:text-orange   dark:hover:text-fuchsia hover:cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out"
                    title={skill.name}
                  >
                    {skill.icon}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllSkills;
