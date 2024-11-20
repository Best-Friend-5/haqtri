import React from 'react';
import './Home.css';
import photo1 from '../images/logo.jpg'; 
import photo2 from '../images/logo.jpg';
import photo3 from '../images/logo.jpg';
import photo4 from '../images/logo.jpg';
import photo5 from '../images/logo.jpg';
import photo6 from '../images/logo.jpg';
import photo7 from '../images/logo.jpg';
import photo8 from '../images/logo.jpg';
import photo9 from '../images/logo.jpg';


function Home() {
  return (
    <div className="home">
      <section className="hero-banner">
        <div className="overlay">
          <h1>Sure Steps to Greatness</h1>
          <p>Empowering young minds with a balanced blend of academic and personal growth.</p>
          <button className="cta-button">Learn More</button>
        </div>
      </section>

      <section className="intro-section">
        <div className="intro-content">
          <div className="title-box">
            <h2>The Twinkle Toes Experience</h2>
            <blockquote>“Where curiosity meets excellence, and every step brings a world of possibilities.”</blockquote>
          </div>
          <div className="intro-box">
            <p>
              At Twinkle Toes Schools, we believe in nurturing both the minds and hearts of our students. Our 
              unique curriculum blend prepares every child to be confident, curious, and ready to make their mark 
              in the world.
            </p>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="mission-vision">
          <div className="mission-box">
            <h2>Our Mission</h2>
            <p>To develop future leaders by providing quality learning opportunities for children.</p>
          </div>
          <div className="vision-box">
            <h2>Our Vision</h2>
            <p>To be an innovative world-class provider of quality education, inspiring creativity, leadership, and excellence in young leaders.</p>
          </div>
        </div>
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <i className="icon integrity-icon" />
            <h3>Integrity</h3>
            <p>Building trust and responsibility in every action.</p>
          </div>
          <div className="value-card">
            <i className="icon passion-icon" />
            <h3>Passion</h3>
            <p>Fueling the drive to learn and grow.</p>
          </div>
          <div className="value-card">
            <i className="icon hardwork-icon" />
            <h3>Hard Work</h3>
            <p>Instilling dedication and persistence.</p>
          </div>
          <div className="value-card">
            <i className="icon teamspirit-icon" />
            <h3>Team Spirit</h3>
            <p>Encouraging collaboration and mutual support.</p>
          </div>
          <div className="value-card">
            <i className="icon excellence-icon" />
            <h3>Excellence</h3>
            <p>Striving for quality and continuous improvement.</p>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <h2>School Moments</h2>
        <p>Take a glimpse into our vibrant school life through these captured moments.</p>
        
        <div className="gallery-grid">
          <div className="gallery-item"><img src={photo1} alt="Gallery 1" /></div>
          <div className="gallery-item"><img src={photo2} alt="Gallery 2" /></div>
          <div className="gallery-item"><img src={photo3} alt="Gallery 3" /></div>
          <div className="gallery-item"><img src={photo4} alt="Gallery 4" /></div>
          <div className="gallery-item"><img src={photo5} alt="Gallery 5" /></div>
          <div className="gallery-item"><img src={photo6} alt="Gallery 6" /></div>
          <div className="gallery-item"><img src={photo7} alt="Gallery 7" /></div>
          <div className="gallery-item"><img src={photo8} alt="Gallery 8" /></div>
          <div className="gallery-item"><img src={photo9} alt="Gallery 9" /></div>
         
        </div>
      </section>

      <section className="curriculum-blend">
        <h2>Our Unique Curriculum Blend</h2>
        <p>
          We combine the Nigerian and British curricula to provide a well-rounded education, preparing students
          for success locally and internationally.
        </p>
        <div className="curriculum-details">
          <div className="curriculum-point">Core Academics</div>
          <div className="curriculum-point">Creative Exploration</div>
          <div className="curriculum-point">Practical Skills</div>
        </div>
      </section>

      <section className="why-choose-us">
        <h2>Why Choose Us?</h2>
        <div className="reasons">
          <div className="reason-card">
            <h3>Experienced Teachers</h3>
            <p>Our teachers are highly qualified and dedicated to student growth.</p>
          </div>
          <div className="reason-card">
            <h3>Balanced Curriculum</h3>
            <p>We offer a blend of Nigerian and British curricula for a holistic education.</p>
          </div>
          <div className="reason-card">
            <h3>Safe Environment</h3>
            <p>We provide a safe, nurturing, and child-friendly environment.</p>
          </div>
          <div className="reason-card">
            <h3>Extracurricular Focus</h3>
            <p>Students develop diverse skills with activities beyond the classroom.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
