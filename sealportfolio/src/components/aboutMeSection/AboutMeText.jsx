import React from 'react';
import ProjectMain from '../projectsSection/ProjectMain';

const AboutMeText = () => {
  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[92%] sm:max-w-2xl md:max-w-3xl lg:max-w-none mx-auto px-3 sm:px-4 md:px-6">
      <h2 className="text-[clamp(1.75rem,6vw,3.75rem)] leading-tight font-bold text-darkblue dark:text-cyan drop-shadow-md mb-6 sm:mb-8 animate-fade-in">
        About <span className="text-orange">Me</span>
      </h2>

      <p className="dark:text-white text-black text-[clamp(0.95rem,2.4vw,1.25rem)] leading-relaxed tracking-normal sm:tracking-wide break-words transition-all duration-300 animate-fade-in-up">
        I’m <span className="text-rose dark:text-orange font-semibold">Soumyadipta Seal</span>, a passionate Full Stack Developer, Mobile App Developer, and Machine Learning enthusiast based in West Bengal, India. I create dynamic and responsive web & mobile apps that blend intuitive UI with powerful backend systems. Since starting my tech journey in <span className="text-amber dark:text-cyan font-medium">2023</span>, I’ve focused on building real-world solutions from the ground up.
      </p>

      <p className="dark:text-white text-black text-[clamp(0.95rem,2.4vw,1.25rem)] leading-relaxed tracking-normal sm:tracking-wide break-words mt-3 sm:mt-4 transition-all duration-300 animate-fade-in-up delay-100">
        From <span className="text-rose dark:text-orange font-medium">cross-platform mobile apps</span> to intelligent systems powered by <span className="text-amber dark:text-cyan font-medium">Machine Learning</span>, I’m also well-versed in <span className="text-rose dark:text-orange font-medium">Salesforce Cloud CRM</span> for efficient business solutions. I'm currently pursuing a <span className="text-amber dark:text-cyan font-semibold">Bachelor’s in Computer Science and Engineering</span>, constantly evolving my skills and pushing boundaries through collaboration and curiosity.
      </p>

      <button
        className="mt-8 sm:mt-10 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-orange text-darkblue dark:text-white hover:text-black dark:hover:text-cyan font-semibold text-sm sm:text-base rounded-full hover:bg-orange active:bg-[#e0b529] focus:bg-[#e0b529] transition-all duration-300 shadow-md hover:shadow-orange-lg animate-fade-in-up delay-200 self-center lg:self-start"
        onClick={() => {
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        View Projects
      </button>
    </div>
  );
};

export default AboutMeText;