import React from 'react';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import PlatformEcosystem from '../components/PlatformEcosystem';
import TrainingPrograms from '../components/TrainingPrograms';
import Mentors from '../components/Mentors';
import CareerJourney from '../components/CareerJourney';
import FeaturedWebinars from '../components/FeaturedWebinars';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <PlatformEcosystem />
      <TrainingPrograms />
      <FeaturedWebinars />
      <Mentors />
      <CareerJourney />
    </>
  );
};

export default HomePage;
