import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalInfo, experience, education, certifications } from '../../data/mock';
import ThreeDCard from './ThreeDCard';
import { Briefcase, GraduationCap, Award, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const contentRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Content animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards stagger animation
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.15,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden"
    >
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">About Me</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Get to Know Me
          </h2>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 mx-auto rounded-full" />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left - Summary */}
          <div ref={contentRef} className="space-y-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              {personalInfo.summary}
            </p>
            
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={18} className="text-cyan-400" />
              <span>{personalInfo.location}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { value: '2+', label: 'Years Coding' },
                { value: '10+', label: 'Projects' },
                { value: '5+', label: 'Technologies' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Cards */}
          <div className="space-y-6">
            {/* Experience Card */}
            <div ref={el => cardsRef.current[0] = el}>
              <ThreeDCard 
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50"
                rotationIntensity={8}
                depth={20}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Briefcase size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Experience</h3>
                    {experience.map((exp, index) => (
                      <div key={index} className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{exp.role}</span>
                          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">{exp.duration}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{exp.company}, {exp.location}</p>
                        <ul className="mt-3 space-y-2">
                          {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                            <li key={idx} className="text-gray-500 text-sm flex items-start gap-2">
                              <span className="w-1 h-1 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </ThreeDCard>
            </div>

            {/* Education Card */}
            <div ref={el => cardsRef.current[1] = el}>
              <ThreeDCard 
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50"
                rotationIntensity={8}
                depth={20}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Education</h3>
                    <div className="mt-4 space-y-4">
                      {education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-cyan-500/30 pl-4">
                          <div className="font-medium text-white">{edu.degree}</div>
                          <p className="text-gray-400 text-sm">{edu.institution}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-gray-500">{edu.duration}</span>
                            <span className="text-cyan-400">{edu.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ThreeDCard>
            </div>

            {/* Certifications Card */}
            <div ref={el => cardsRef.current[2] = el}>
              <ThreeDCard 
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50"
                rotationIntensity={8}
                depth={20}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Award size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Certifications</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {certifications.map((cert, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 text-sm bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700/50"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ThreeDCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;