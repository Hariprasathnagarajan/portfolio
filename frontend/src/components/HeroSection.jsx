import React from 'react';
import Spline from '@splinetool/react-spline';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '100px 7.6923%',
      background: '#000000',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Left Content */}
        <div style={{ zIndex: 2 }}>
          <h1 className="display-huge" style={{ marginBottom: '24px' }}>
            Professional Audit Solutions
          </h1>
          <p className="body-large" style={{ 
            marginBottom: '40px',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            Revolutionize your workflow and elevate your business with our cutting-edge technology.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-primary">
              Get Started
              <ArrowRight size={20} />
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Content - Spline 3D */}
        <div style={{ 
          width: '700px', 
          height: '700px', 
          overflow: 'visible', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spline scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode" />
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          section {
            padding: 80px 5% !important;
          }
          section > div {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          section > div > div:last-child {
            width: 100% !important;
            height: 500px !important;
          }
        }
        @media (max-width: 768px) {
          section {
            padding: 60px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;