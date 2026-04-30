import React from 'react';
import InfoPageLayout from '../components/InfoPageLayout';

const aboutSections = [
  {
    paragraphs: [
      'GradToPro is an emerging career-focused education platform designed to bridge the gap between academic learning and real-world industry requirements. The platform focuses on helping students become industry-ready through practical, project-based learning and certification programs.',
      'Our mission is to transform students into skilled professionals by providing hands-on experience, real-time projects, and industry-aligned training. Unlike traditional learning systems that focus only on theoretical knowledge, GradToPro emphasizes practical exposure, problem-solving, and job readiness.',
      'GradToPro offers a wide range of services including certification programs, real-time project experience, mentorship, and placement-oriented training. The platform is built with the vision of connecting students, institutions, and companies into a unified ecosystem where talent meets opportunity.',
      'We believe that the future belongs to those who can apply knowledge, not just learn it. Our goal is to empower learners with the right skills, tools, and guidance to succeed in their careers.',
      'GradToPro is aligned with modern learning approaches such as AI-driven learning paths, industry collaboration, and skill-based training, helping students transition smoothly from education to employment.'
    ]
  }
];

const AboutUsPage = () => {
  return (
    <InfoPageLayout
      title="About Us"
      sections={aboutSections}
    />
  );
};

export default AboutUsPage;
