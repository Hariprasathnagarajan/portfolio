import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const CTASection = () => {
  return (
    <section id="contact" style={{
      padding: '100px 7.6923%',
      background: '#000000'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        background: 'rgba(0, 255, 209, 0.05)',
        border: '2px solid var(--brand-primary)',
        padding: '80px 60px'
      }}>
        <h2 className="display-large" style={{ marginBottom: '24px' }}>
          Ready to Transform Your Audit Process?
        </h2>
        <p className="body-large" style={{ 
          marginBottom: '40px',
          color: 'rgba(255, 255, 255, 0.85)'
        }}>
          Join hundreds of companies who trust AuditPro for their audit needs.
        </p>
        <button className="btn-primary" style={{
          padding: '18px 48px',
          fontSize: '20px',
          minHeight: '64px'
        }}>
          Schedule a Demo
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section {
            padding: 60px 20px !important;
          }
          section > div {
            padding: 40px 30px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CTASection;