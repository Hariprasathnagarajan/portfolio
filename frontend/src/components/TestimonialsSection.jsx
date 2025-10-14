import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CFO, TechCorp Industries',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    quote: 'AuditPro transformed our entire audit process. The automation features saved us countless hours and the insights are invaluable.'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Compliance, FinanceHub',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    quote: 'The seamless integration with our existing systems was impressive. We saw improvements in efficiency within the first month.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Audit Manager, Global Solutions Ltd',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    quote: 'Data-driven insights have revolutionized how we approach audits. The platform is intuitive and incredibly powerful.'
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" style={{
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
          What Our Clients Say
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px'
        }}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="dark-hover"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '40px',
                position: 'relative',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              <Quote 
                size={40} 
                color="var(--brand-primary)" 
                style={{ 
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: 0.3
                }} 
              />
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    marginRight: '16px',
                    border: '2px solid var(--brand-primary)'
                  }}
                />
                <div>
                  <h4 className="heading-2" style={{ marginBottom: '4px', fontSize: '20px' }}>
                    {testimonial.name}
                  </h4>
                  <p className="body-medium" style={{ 
                    fontSize: '14px',
                    color: 'var(--text-muted)'
                  }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <p className="body-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                "{testimonial.quote}"
              </p>
            </div>
          ))}
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

export default TestimonialsSection;