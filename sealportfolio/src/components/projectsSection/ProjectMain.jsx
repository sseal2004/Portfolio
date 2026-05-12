import React from 'react';
import ProjectText from './ProjectText';
import SingleProject from './SingleProject';
// Dummy project data
const projects = [
  {
    name: 'Vacation of Africa',
    year: 'Mar 2022',
    align: 'right',
    image: '/projects/africa.jpg',
    live: '#',
    sourceCode: '#',
  },
  {
    name: 'Explore Europe',
    year: 'Jul 2023',
    align: 'left',
    image: '/projects/europe.jpg',
    live: '#',
    sourceCode: '#',
  },
  {
    name: 'Mystery of Amazon',
    year: 'Jan 2024',
    align: 'right',
    image: '/projects/amazon.jpg',
    live: '#',
    sourceCode: '#',
  },
];

const ProjectMain = () => {
  return (
    <section id="project" className="w-full px-4 py-12">
      <div
      
      className="flex flex-col gap-16 max-w-[1200px] mx-auto">
        
        <ProjectText />

        {projects.map((item, index) => (
          <SingleProject
            key={`${item.name}-${index}`}
            name={item.name}
            year={item.year}
            align={item.align}
            image={item.image}
            link={item.live}
          />
        ))}
      </div>
    </section>
  );
};

export default ProjectMain;
