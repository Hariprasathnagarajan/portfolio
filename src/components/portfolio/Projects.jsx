import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../../data/mock';
import ThreeDCard from './ThreeDCard';
import { ExternalLink, Github, Folder } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const projectsRef = useRef([]);

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

      // Projects stagger animation
      projectsRef.current.forEach((project, index) => {
        if (project) {
          gsap.fromTo(project,
            { opacity: 0, y: 60, rotateX: -10 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              delay: index * 0.1,
              scrollTrigger: {
                trigger: project,
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

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gray-950 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Portfolio</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Featured Projects
          </h2>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 mx-auto rounded-full" />
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            A selection of projects that showcase my expertise in building scalable, production-grade applications
          </p>
        </div>

        {/* Featured Projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredProjects.map((project, index) => (
            <div 
              key={project.id}
              ref={el => projectsRef.current[index] = el}
              style={{ perspective: '1000px' }}
            >
              <ThreeDCard
                className="h-full rounded-2xl bg-gray-900/50 border border-gray-800/50 overflow-hidden group"
                rotationIntensity={8}
                depth={25}
                hoverScale={1.02}
              >
                {/* Project Image/Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Folder size={48} className="text-cyan-500/20" />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Featured badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tech.map((tech) => (
                      <span 
                        key={tech}
                        className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded border border-gray-700/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-800/50">
                    <a
                      href={project.github}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Github size={16} />
                      Code
                    </a>
                    <a
                      href={project.live}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Live Demo
                    </a>
                  </div>
                </div>
              </ThreeDCard>
            </div>
          ))}
        </div>

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-white text-center mb-8">Other Projects</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {otherProjects.map((project, index) => (
                <div 
                  key={project.id}
                  ref={el => projectsRef.current[featuredProjects.length + index] = el}
                  className="p-6 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h4>
                      <p className="mt-2 text-gray-400 text-sm">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tech.slice(0, 3).map((tech) => (
                          <span 
                            key={tech}
                            className="px-2 py-1 text-xs bg-gray-800/50 text-gray-500 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <a
                        href={project.github}
                        className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                        aria-label="View code"
                      >
                        <Github size={18} />
                      </a>
                      <a
                        href={project.live}
                        className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                        aria-label="View live demo"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;