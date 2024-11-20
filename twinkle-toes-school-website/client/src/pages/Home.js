import React, { useState, useEffect } from 'react';
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

const photos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

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

        {isMobile ? (
          <div className="carousel">
            <button className="prev-button" onClick={prevSlide}>&lt;</button>
            <div className="carousel-slide">
              <img src={photos[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
            </div>
            <button className="next-button" onClick={nextSlide}>&gt;</button>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo, index) => (
              <div className="gallery-item" key={index}>
                <img src={photo} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="curriculum-blend">
  <h2>Discover Our Unique Approach</h2>
  <p>
    At Twinkle Toes Schools, we provide a transformative learning experience tailored to every stage of growth. 
    From nurturing independence in our Montessori classes to fostering global readiness through a blend of 
    Nigerian and British curricula, we prepare students to excel in academics and life.
  </p>
  <div className="curriculum-details">
    <div className="curriculum-point">
      <h3>Montessori Excellence (Years 1-6)</h3>
      <p>
        A child-centered approach that emphasizes hands-on learning, independence, and discovery. 
        Perfect for building foundational skills and lifelong curiosity.
      </p>
    </div>
    <div className="curriculum-point">
      <h3>Nigerian & British Blend</h3>
      <p>
        Combining the strengths of two renowned curricula to equip students with local and global competencies 
        for the challenges of the modern world.
      </p>
    </div>
    <div className="curriculum-point">
      <h3>Leadership & Creativity</h3>
      <p>
        Our focus on entrepreneurship, critical thinking, and creative expression ensures every child develops 
        leadership qualities and innovative thinking.
      </p>
    </div>
  </div>
  <button className="learn-more-button">Learn More</button>
</section>


<section className="why-choose-us">
  <h2>Why Choose Us?</h2>
  <p>Explore the key features that make Twinkle Toes Schools the ideal place for your child's growth.</p>
  <div className="reasons">
    <div className="reason-card">
      <i className="icon fa fa-chalkboard-teacher" aria-hidden="true"></i>
      <h3>Experienced Teachers</h3>
      <p>Our highly trained educators focus on unlocking every child’s potential.</p>
    </div>
    <div className="reason-card">
      <i className="icon fa fa-book-reader" aria-hidden="true"></i>
      <h3>Balanced Curriculum</h3>
      <p>A seamless blend of Nigerian and British curricula fosters holistic learning.</p>
    </div>
    <div className="reason-card">
      <i className="icon fa fa-shield-alt" aria-hidden="true"></i>
      <h3>Safe Environment</h3>
      <p>A secure, nurturing space where every child feels valued and protected.</p>
    </div>
    <div className="reason-card">
      <i className="icon fa fa-star" aria-hidden="true"></i>
      <h3>Extracurricular Focus</h3>
      <p>From sports to music, our activities help develop well-rounded individuals.</p>
    </div>
  </div>
</section>

    </div>
  );
}

export default Home;
