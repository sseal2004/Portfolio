import React from 'react';
import ProjectMain from '../projectsSection/ProjectMain';

const AboutMeText = () => {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-darkblue dark:text-cyan drop-shadow-md mb-8 animate-fade-in">
        About <span className="text-orange">Me</span>
      </h2>

      <p className="dark:text-white text-black  text-base sm:text-lg md:text-xl leading-relaxed tracking-wide transition-all duration-300 animate-fade-in-up">
        I’m <span className="text-rose dark:text-orange font-semibold">Soumyadipta Seal</span>, a passionate Full Stack Developer, Mobile App Developer, and Machine Learning enthusiast based in West Bengal, India. I create dynamic and responsive web & mobile apps that blend intuitive UI with powerful backend systems. Since starting my tech journey in <span className="text-amber dark:text-cyan font-medium">2023</span>, I’ve focused on building real-world solutions from the ground up.
      </p>

      <p className="dark:text-white text-black text-base sm:text-lg md:text-xl leading-relaxed tracking-wide mt-4 transition-all duration-300 animate-fade-in-up delay-100">
        From <span className="text-rose dark:text-orange font-medium">cross-platform mobile apps</span> to intelligent systems powered by <span className="text-amber dark:text-cyan font-medium">Machine Learning</span>, I’m also well-versed in <span className="text-rose dark:text-orange font-medium">Salesforce Cloud CRM</span> for efficient business solutions. I'm currently pursuing a <span className="text-amber dark:text-cyan font-semibold">Bachelor’s in Computer Science and Engineering</span>, constantly evolving my skills and pushing boundaries through collaboration and curiosity.
      </p>

     <button
  className="mt-10 px-6 py-3 border border-orange text-darkblue dark:text-white hover:text-black dark:hover:text-cyan font-semibold rounded-full hover:bg-orange active:bg-[#e0b529] focus:bg-[#e0b529] transition-all duration-300 shadow-md hover:shadow-orange-lg animate-fade-in-up delay-200 md:self-start sm:self-center"
  onClick={() => {
    document.getElementById("project")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  View Projects
</button>

    </div>
  );
};

export default AboutMeText;
