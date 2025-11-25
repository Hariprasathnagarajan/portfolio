import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { personalInfo } from '../../data/mock';
import ThreeDCard from './ThreeDCard';
import FloatingTechIcons from './FloatingTechIcons';
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-react';

const Hero = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  const cardRef = useRef(null);
  const socialRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, descRef.current, buttonsRef.current, socialRef.current], {
        opacity: 0,
        y: 50
      });
      gsap.set(cardRef.current, { opacity: 0, scale: 0.8, rotateY: -30 });
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: -20 });

      // Animate elements
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
        .to(buttonsRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.9)
        .to(cardRef.current, { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0, 
          duration: 1,
          ease: 'back.out(1.7)'
        }, 0.6)
        .to(socialRef.current, { opacity: 1, y: 0, duration: 0.6 }, 1.1)
        .to(scrollIndicatorRef.current, { opacity: 1, y: 0, duration: 0.6 }, 1.3);

      // Continuous scroll indicator animation
      gsap.to(scrollIndicatorRef.current, {
        y: 10,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 2
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Greeting */}
            <div ref={subtitleRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Available for opportunities</span>
            </div>

            {/* Title */}
            <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Hi, I am{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                {personalInfo.name}
              </span>
            </h1>

            {/* Role */}
            <p ref={descRef} className="text-xl sm:text-2xl text-gray-400 font-medium">
              {personalInfo.title}
              <span className="block mt-2 text-base sm:text-lg text-gray-500">
                {personalInfo.tagline}
              </span>
            </p>

            {/* CTA Buttons */}
            <div ref={buttonsRef} className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <a
                href="#projects"
                className="group px-6 py-3 bg-cyan-500 text-gray-950 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 flex items-center gap-2"
              >
                View My Work
                <svg 
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#contact"
                className="px-6 py-3 bg-transparent text-white font-semibold rounded-lg border border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300"
              >
                Contact Me
              </a>
            </div>

            {/* Social Links */}
            <div ref={socialRef} className="flex items-center gap-4 pt-6 justify-center lg:justify-start">
              <span className="text-gray-500 text-sm">Find me on</span>
              <div className="flex items-center gap-3">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Card with Tech Icons */}
          <div ref={cardRef} className="relative flex items-center justify-center">
            <ThreeDCard 
              className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 backdrop-blur-sm"
              rotationIntensity={10}
              depth={30}
            >
              <div className="space-y-6">
                <div className="text-center">
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-cyan-400">
                      {personalInfo.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{personalInfo.name}</h3>
                  <p className="text-cyan-400 text-sm">{personalInfo.title}</p>
                </div>
                
                <div className="pt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-4 text-center">Tech Stack</p>
                  <FloatingTechIcons className="scale-75 -mx-4" />
                </div>
              </div>
            </ThreeDCard>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={handleScrollToAbout}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <ArrowDown size={20} className="animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;