import React from 'react';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import PlatformEcosystem from '../components/PlatformEcosystem';
import Mentors from '../components/Mentors';
import CareerJourney from '../components/CareerJourney';
import FeaturedWebinars from '../components/FeaturedWebinars';
import TrainingPrograms from '../components/TrainingPrograms';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <PlatformEcosystem />
      <Mentors />
      <CareerJourney />
      <TrainingPrograms />
      <FeaturedWebinars />
    </>
  );
};

export default HomePage;
