import React, { useState, useEffect } from 'react';
import NavbarMain from './components/navbar/NavbarMain';
import HeroMain from './components/heroSection/HeroMain';
import HeroGradient from './components/heroSection/HeroGradient';
import SubHeroSection from './components/heroSection/SubHeroSection';
import AboutMeMain from './components/aboutMeSection/AboutMeMain';
import SkillsMain from './components/skillSection/SkillsMain';
import SkillSub from './components/skillSection/SkillSub';
import ExperienceMain from './components/experienceSection/ExperienceMain';
import ProjectMain from './components/projectsSection/ProjectMain';
import ContactMeMain from './components/contactMeSection/ContactMeMain';
import FooterMain from './components/footer/FooterMain';
import SexyLoader from './components/loader/SexyLoader';
import ChatBot from './components/chatbot/ChatBot'; // 🤖 Chatbot component
import CertificateMain from './components/certificates/CertificateMain'

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enable smooth scrolling on the root html element
    document.documentElement.style.scrollBehavior = 'smooth';

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (loading) return <SexyLoader />;

  return (
    <div id="home" className="relative w-full h-full">
      {/* Background Layer */}
      <div className="fixed inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-xl transition-colors duration-300 -z-10" />

      {/* Foreground Content */}
      <main className="relative z-10 font-body">
        {/* 🐝 Bee Overlay */}
        <div className="pointer-events-none fixed inset-0 z-50">
          {/* <HoneyBee /> */}
        </div>

        {/* Main Sections */}
        <NavbarMain />
        <HeroMain />
        <HeroGradient />
        <SubHeroSection />
        <AboutMeMain />
        <SkillsMain />
        <div className="m-0 p-0">
          <SkillSub />
          <ExperienceMain />
          <ProjectMain />
          <CertificateMain />
          <ContactMeMain />
        </div>
        <FooterMain className="mt-0" />
      </main>

      {/* 🤖 Floating Chatbot — always on top, outside main flow */}
      <ChatBot />
    </div>
  );
}

export default App;