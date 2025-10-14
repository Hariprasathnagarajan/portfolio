import React from 'react';

const Header = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="dark-header">
      <div className="dark-logo">AuditPro</div>
      <nav className="dark-nav">
        <span className="dark-nav-link" onClick={() => scrollToSection('services')}>Services</span>
        <span className="dark-nav-link" onClick={() => scrollToSection('about')}>About</span>
        <span className="dark-nav-link" onClick={() => scrollToSection('testimonials')}>Testimonials</span>
        <span className="dark-nav-link" onClick={() => scrollToSection('contact')}>Contact</span>
      </nav>
    </header>
  );
};

export default Header;