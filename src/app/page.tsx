import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MissionSection from '@/components/MissionSection';
import ProcessSection from '@/components/ProcessSection';
import ScenariosSection from '@/components/Scenariossection';
import RegisterSection from '@/components/RegisterSection';
import ContactSection from '@/components/ContactSection';
import MembershipPlanSection from '@/components/MembershipPlanSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <MissionSection />
      <ProcessSection />
      <ScenariosSection />
      <MembershipPlanSection />
      <RegisterSection />
      <ContactSection />
    </>
  );
}