import React from 'react';
import { Zap, BarChart3, Link2, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Automation',
    description: 'Automate repetitive tasks and focus on what truly matters.'
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Insights',
    description: 'Gain actionable insights from your data to make smarter decisions.'
  },
  {
    icon: Link2,
    title: 'Seamless Integration',
    description: 'Easily integrate with your existing tools and platforms.'
  },
  {
    icon: TrendingUp,
    title: 'Scalable Performance',
    description: 'Grow your operations without compromising on speed or efficiency.'
  }
];

const FeaturesSection = () => {
  return (
    <section id="services" style={{
      padding: '100px 7.6923%',
      background: '#000000'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 className="display-large" style={{ 
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          Our Services
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="dark-hover"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '40px',
                  transition: 'all 0.4s ease-in-out'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <Icon size={28} color="#000000" strokeWidth={2} />
                </div>
                <h3 className="heading-2" style={{ marginBottom: '16px' }}>
                  {feature.title}
                </h3>
                <p className="body-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section {
            padding: 60px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;