import React from 'react';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import PlatformEcosystem from '../components/PlatformEcosystem';
import IndustrialCertification from '../components/IndustrialCertification';
import TrainingPrograms from '../components/TrainingPrograms';
import Mentors from '../components/Mentors';
import PlacementPortal from '../components/PlacementPortal';
import CareerJourney from '../components/CareerJourney';
import FeaturedWebinars from '../components/FeaturedWebinars';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <PlatformEcosystem />
      <IndustrialCertification />
      <TrainingPrograms />
      <FeaturedWebinars />
      <Mentors />
      <PlacementPortal />
      <CareerJourney />
    </>
  );
};

export default HomePage;
