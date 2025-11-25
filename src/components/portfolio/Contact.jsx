import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalInfo } from '../../data/mock';
import ThreeDCard from './ThreeDCard';
import { Mail, Phone, MapPin, Github, Linkedin, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
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
            { opacity: 0, x: index % 2 === 0 ? -30 : 30, scale: 0.95 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
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

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: personalInfo.phone,
      href: `tel:${personalInfo.phone}`,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: personalInfo.location,
      href: null,
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: personalInfo.github,
      username: '@hariprasathnagarajan'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: personalInfo.linkedin,
      username: 'hariprasath-nagarajan'
    }
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gray-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Get In Touch</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Let's Work Together
          </h2>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 mx-auto rounded-full" />
        </div>

        <div ref={contentRef} className="max-w-4xl mx-auto">
          {/* CTA Message */}
          <div className="text-center mb-12">
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              I am currently available for freelance work and full-time positions. 
              If you have a project in mind or just want to chat, feel free to reach out!
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div 
                key={method.label}
                ref={el => cardsRef.current[index] = el}
              >
                <ThreeDCard
                  className="h-full p-6 rounded-xl bg-gray-950/50 border border-gray-800/50 text-center"
                  rotationIntensity={10}
                  depth={20}
                >
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${method.color} p-0.5 mb-4`}>
                    <div className="w-full h-full rounded-xl bg-gray-950 flex items-center justify-center">
                      <method.icon size={24} className="text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-white font-medium mb-2">{method.label}</h3>
                  {method.href ? (
                    <a 
                      href={method.href}
                      className="text-gray-400 text-sm hover:text-cyan-400 transition-colors break-all"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">{method.value}</span>
                  )}
                </ThreeDCard>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => cardsRef.current[contactMethods.length + index] = el}
                className="group flex items-center gap-4 px-6 py-4 rounded-xl bg-gray-950/50 border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 w-full sm:w-auto"
              >
                <div className="p-3 rounded-lg bg-gray-800/50 group-hover:bg-cyan-500/10 transition-colors">
                  <social.icon size={24} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                    {social.label}
                  </div>
                  <div className="text-gray-500 text-sm">{social.username}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Quick CTA */}
          <div className="mt-12 text-center">
            <a
              href={`mailto:${personalInfo.email}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-gray-950 font-semibold rounded-xl hover:bg-cyan-400 transition-all duration-300 group"
            >
              <Send size={20} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Send Me an Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;