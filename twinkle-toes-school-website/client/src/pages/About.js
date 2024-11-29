import React from 'react';
import './About.css';
import schoolPhoto1 from '../images/about1.jpg';
import schoolPhoto2 from '../images/about1.jpg';
import schoolPhoto3 from '../images/about1.jpg';
import proprietressPhoto from '../images/banner.jpg';
import brochure from '../files/brochure.pdf';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      {/* Hero Section */}
{/* Hero Section */}
<section className="welcome-section">
  <div className="welcome-container">
    <div className="welcome-text">
      <h1>Step Into a World of Wonder</h1>
      <p>
        At Twinkle Toes Schools, every child embarks on a journey of discovery, creativity, 
        and growth. With a nurturing environment and innovative learning approaches, 
        we inspire young minds to dream big and achieve their fullest potential.
      </p>
    </div>
    <div className="welcome-image">
      <img src={proprietressPhoto} alt="Twinkle Toes Schools" />
    </div>
  </div>
</section>



      {/* School Environment Showcase */}
      {/* School Environment Showcase */}
<section className="school-showcase">
  <h2 className="section-title">Where Learning Comes to Life</h2>
  <div className="showcase-item">
    <img src={schoolPhoto1} alt="Classroom" />
    <div className="showcase-text">
      <h2>Interactive Learning Spaces</h2>
      <p>
        Twinkle Toes Schools is committed to fostering an environment where students feel engaged and inspired. 
        Our classrooms are designed with vibrant decor, flexible seating, and modern teaching aids to make 
        learning an exciting experience. Every detail is tailored to encourage creativity, collaboration, and 
        critical thinking among students.
      </p>
    </div>
  </div>
  <div className="showcase-item reverse-layout">
    <img src={schoolPhoto2} alt="Library" />
    <div className="showcase-text">
      <h2>Well-Stocked Library</h2>
      <p>
        At the heart of Twinkle Toes Schools is our well-stocked library, a treasure trove of knowledge that 
        fuels the imagination of young learners. From storybooks that captivate young minds to reference materials 
        that support academic growth, the library is a cornerstone of our learning environment. Students are encouraged 
        to explore, read, and develop a lifelong love for books.
      </p>
    </div>
  </div>
  <div className="showcase-item">
    <img src={schoolPhoto3} alt="Playground" />
    <div className="showcase-text">
      <h2>Safe and Fun Playground</h2>
      <p>
        Beyond academics, Twinkle Toes Schools believes in the importance of play for holistic development. 
        Our playground is a safe and dynamic space where children can engage in physical activities, develop 
        social skills, and build teamwork. With safety as our top priority, the playground offers a variety of 
        equipment and spaces to ensure every child enjoys their playtime.
      </p>
    </div>
  </div>
</section>



                      


      {/* Meet the Proprietress */}
      <section className="proprietress-section">
        <h2>Meet the Proprietress</h2>
        <div className="proprietress-layout">
          <div className="proprietress-photo">
            <img src={proprietressPhoto} alt="Proprietress" />
          </div>
          <div className="proprietress-details">
            <h3>Dr Abah Evangeline</h3>
            <p className="proprietress-bio">
              With over 15 years of dedication to education, Mrs. Doe has made it her mission to 
              inspire, nurture, and empower young minds. Her vision is to create an environment 
              where every child thrives academically and personally.
            </p>
            <blockquote className="proprietress-quote">
              "Empowering children today for a brighter tomorrow."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Brochure Download */}
      <section className="download-brochure">
        <a href={brochure} download className="download-button">
          Download Our Brochure
        </a>
      </section>
    </div>
  );
};

export default About;
