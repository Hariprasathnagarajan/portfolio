import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skills } from '../../data/mock';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const skillsRef = useRef([]);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

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

      // Skills animation
      skillsRef.current.forEach((skill, index) => {
        if (skill) {
          gsap.fromTo(skill,
            { opacity: 0, y: 30, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              delay: index * 0.05,
              scrollTrigger: {
                trigger: skill,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      Languages: '{ }',
      Frontend: '</>',
      Backend: '⚙️',
      Database: '🗄️',
      DevOps: '🔧',
      Tools: '🛠️',
      'Real-time': '⚡'
    };
    return icons[category] || '✨';
  };

  let skillIndex = 0;

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gray-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">My Expertise</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Skills & Technologies
          </h2>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 mx-auto rounded-full" />
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            A comprehensive toolkit built over years of hands-on experience in full-stack development
          </p>
        </div>

        {/* Skills Grid by Category */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div 
              key={category}
              className="p-6 rounded-2xl bg-gray-950/50 border border-gray-800/50 hover:border-cyan-500/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <h3 className="text-lg font-semibold text-white">{category}</h3>
              </div>
              
              <div className="space-y-4">
                {categorySkills.map((skill) => {
                  const currentIndex = skillIndex++;
                  return (
                    <div 
                      key={skill.name}
                      ref={el => skillsRef.current[currentIndex] = el}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm font-medium group-hover:text-cyan-400 transition-colors">
                          {skill.name}
                        </span>
                        <span className="text-cyan-400 text-xs">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Skills Tags */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Also experienced with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['RESTful APIs', 'GraphQL', 'JWT Auth', 'Agile/Scrum', 'CI/CD', 'Linux', 'n8n Automation'].map((tag) => (
              <span 
                key={tag}
                className="px-4 py-2 text-sm bg-gray-800/50 text-gray-400 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-300 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;