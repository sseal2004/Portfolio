import React from 'react';

import Timeline from './TimeLine';

const ExperienceMain = () => {
  return (
    <section
  id="experience"
  className="py-[40px] px-4 bg-gradient-to-b from-blue via-orange to-blue  dark:from-[#0f0c29] dark:via-[#1b1b2f] dark:to-[#24243e]"
>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          My Development{' '}
          <span className="bg-gradient-to-b from-orange to-rose dark:from-blue dark:to-fuchsia text-transparent bg-clip-text">
            Journey
          </span>
        </h2>
        <p className="text-gray-300 mt-4">
          From frontend enthusiast to full-stack developer – my journey through code and creativity
        </p>
      </div>

      {/* Timeline section */}
      <div className="max-w-5xl mx-auto">
        <Timeline />
      </div>
    </section>
  );
};

export default ExperienceMain;

