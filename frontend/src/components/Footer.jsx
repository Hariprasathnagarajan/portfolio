import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: '#000000',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '60px 7.6923% 40px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Company Info */}
          <div>
            <div className="dark-logo" style={{ marginBottom: '16px' }}>AuditPro</div>
            <p className="body-medium" style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              Professional audit solutions powered by cutting-edge technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="heading-2" style={{ marginBottom: '16px', fontSize: '18px' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#services" className="dark-nav-link" style={{ fontSize: '16px' }}>Services</a>
              <a href="#about" className="dark-nav-link" style={{ fontSize: '16px' }}>About</a>
              <a href="#testimonials" className="dark-nav-link" style={{ fontSize: '16px' }}>Testimonials</a>
              <a href="#contact" className="dark-nav-link" style={{ fontSize: '16px' }}>Contact</a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="heading-2" style={{ marginBottom: '16px', fontSize: '18px' }}>
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--brand-primary)" />
                <span className="body-medium" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  info@auditpro.com
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} color="var(--brand-primary)" />
                <span className="body-medium" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  +1 (555) 123-4567
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--brand-primary)" />
                <span className="body-medium" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  123 Business Ave, NY 10001
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="heading-2" style={{ marginBottom: '16px', fontSize: '18px' }}>
              Follow Us
            </h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <Linkedin size={20} color="var(--brand-primary)" />
              </a>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <Twitter size={20} color="var(--brand-primary)" />
              </a>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <Facebook size={20} color="var(--brand-primary)" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          textAlign: 'center'
        }}>
          <p className="body-medium" style={{ 
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}>
            © 2025 AuditPro. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer {
            padding: 40px 20px 30px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;