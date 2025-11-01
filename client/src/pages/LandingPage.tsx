import React from 'react';
import Navbar from '../components/Landing page/Navbar';
import Hero from '../components/Landing page/Hero';
import AboutUs from '../components/Landing page/AboutUs';
import Pricing from '../components/Landing page/Pricing';
import FAQ from '../components/Landing page/FAQ';
import Footer from '../components/Landing page/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;

