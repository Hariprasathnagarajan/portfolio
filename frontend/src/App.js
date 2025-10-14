import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <div id="about" style={{
          padding: '100px 7.6923%',
          background: '#000000'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 className="display-large" style={{ marginBottom: '24px' }}>
              About AuditPro
            </h2>
            <p className="body-large" style={{ 
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: '1.8'
            }}>
              AuditPro is a cutting-edge audit solutions platform that combines artificial intelligence 
              with industry expertise to deliver unparalleled audit services. Our mission is to transform 
              traditional audit processes through automation, data-driven insights, and seamless integration 
              capabilities. With years of experience and a commitment to innovation, we help businesses of 
              all sizes achieve audit excellence.
            </p>
          </div>
        </div>
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;