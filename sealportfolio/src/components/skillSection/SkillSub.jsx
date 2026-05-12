import React from 'react';

const SkillSub = () => {
  return (
    <div className="relative border-y-2 border-lightGrey mt-12 mb-0 rounded-xl overflow-hidden shadow-xl max-h-[15vh]">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue to-cyan opacity-20 z-10 pointer-events-none" />

      {/* Video */}
      <video
        className="w-full h-full object-cover z-0"
        src="/video/skillsub.mp4"
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
      />
    </div>
  );
};

export default SkillSub;
