import React from 'react';
import Head from 'next/head';

const CinematicShowcase: React.FC = () => {
  return (
    <>
      <Head>
        <title>Cinematic Effects Showcase</title>
      </Head>
      
      <div className="cinematic-showcase">
        {/* Hero Section with top-left element */}
        <section className="hero-section">
          <div className="top-left-badge" data-testid="hero-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">New</span>
          </div>
          
          <div className="hero-content">
            <h1 className="hero-title">Experience Cinema</h1>
            <p className="hero-subtitle">Scroll to discover the story</p>
          </div>
          
          <div className="scroll-indicator">
            <div className="scroll-arrow">↓</div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="journey-section" data-testid="journey">
          <div className="container">
            <h2 className="section-title">The Journey Begins</h2>
            <div className="feature-grid">
              <div className="feature-card" data-testid="feature-1">
                <div className="feature-icon">🎬</div>
                <h3>Cinematic Movements</h3>
                <p>Smooth camera transitions that tell your story</p>
              </div>
              <div className="feature-card" data-testid="feature-2">
                <div className="feature-icon">🎯</div>
                <h3>Precise Control</h3>
                <p>Direct attention exactly where you want it</p>
              </div>
              <div className="feature-card" data-testid="feature-3">
                <div className="feature-icon">✨</div>
                <h3>Visual Polish</h3>
                <p>Professional effects that captivate viewers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section" data-testid="story">
          <div className="story-content">
            <div className="story-left">
              <h2>Every Frame Tells a Story</h2>
              <p>From subtle zooms to dramatic reveals, create videos that engage and inspire.</p>
            </div>
            <div className="story-right">
              <div className="story-visual">
                <div className="floating-element element-1">📷</div>
                <div className="floating-element element-2">🎥</div>
                <div className="floating-element element-3">🎞️</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with bottom-right element */}
        <section className="cta-section" data-testid="cta">
          <div className="cta-content">
            <h2>Ready to Create?</h2>
            <p>Transform your demos into cinematic experiences</p>
            <button className="cta-button" data-testid="main-cta">
              Get Started
            </button>
          </div>
          
          <div className="bottom-right-accent" data-testid="bottom-accent">
            <div className="accent-circle"></div>
            <div className="accent-text">Pro</div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .cinematic-showcase {
          min-height: 100vh;
          background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
          color: white;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          background: radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%);
        }

        .top-left-badge {
          position: absolute;
          top: 40px;
          left: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 8px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          animation: pulse 2s infinite;
        }

        .badge-icon {
          font-size: 18px;
        }

        .hero-content {
          text-align: center;
          z-index: 1;
        }

        .hero-title {
          font-size: 72px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(to right, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 24px;
          margin-top: 20px;
          opacity: 0.8;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          animation: bounce 2s infinite;
        }

        .scroll-arrow {
          font-size: 32px;
          opacity: 0.6;
        }

        /* Journey Section */
        .journey-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 80px 20px;
          background: linear-gradient(to bottom, #1a1a1a, #0f0f0f);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .section-title {
          font-size: 48px;
          text-align: center;
          margin-bottom: 60px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        /* Story Section */
        .story-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 80px 20px;
          background: #0a0a0a;
        }

        .story-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .story-left h2 {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .story-left p {
          font-size: 20px;
          opacity: 0.8;
          line-height: 1.6;
        }

        .story-visual {
          position: relative;
          height: 400px;
        }

        .floating-element {
          position: absolute;
          font-size: 64px;
          animation: float 3s ease-in-out infinite;
        }

        .element-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .element-2 {
          top: 50%;
          right: 20%;
          animation-delay: 1s;
        }

        .element-3 {
          bottom: 20%;
          left: 40%;
          animation-delay: 2s;
        }

        /* CTA Section */
        .cta-section {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          background: radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%);
        }

        .cta-content {
          text-align: center;
          z-index: 1;
        }

        .cta-content h2 {
          font-size: 56px;
          margin-bottom: 20px;
        }

        .cta-content p {
          font-size: 24px;
          margin-bottom: 40px;
          opacity: 0.8;
        }

        .cta-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 20px 60px;
          font-size: 20px;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .bottom-right-accent {
          position: absolute;
          bottom: 40px;
          right: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .accent-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .accent-text {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Animations */
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 48px;
          }
          
          .feature-grid {
            grid-template-columns: 1fr;
          }
          
          .story-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          
          .story-visual {
            height: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default CinematicShowcase;