import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const ThreeDCard = ({ 
  children, 
  className = '', 
  rotationIntensity = 15, 
  depth = 40,
  glareEnabled = true,
  hoverScale = 1.02
}) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -rotationIntensity;
    const rotateY = (mouseX / (rect.width / 2)) * rotationIntensity;
    
    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Glare effect
    if (glareRef.current && glareEnabled) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      gsap.to(glareRef.current, {
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)`,
        duration: 0.3
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: hoverScale,
        boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.25)',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0 10px 40px -15px rgba(6, 182, 212, 0.1)',
        duration: 0.5,
        ease: 'power2.out'
      });
    }
    if (glareRef.current) {
      gsap.to(glareRef.current, {
        background: 'transparent',
        duration: 0.3
      });
    }
  };

  return (
    <div 
      className="perspective-[1000px]"
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        className={`relative transform-gpu transition-shadow ${className}`}
        style={{ 
          transformStyle: 'preserve-3d',
          boxShadow: '0 10px 40px -15px rgba(6, 182, 212, 0.1)'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glare overlay */}
        {glareEnabled && (
          <div 
            ref={glareRef}
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            style={{ borderRadius: 'inherit' }}
          />
        )}
        
        {/* Content */}
        <div style={{ transform: `translateZ(${depth}px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ThreeDCard;