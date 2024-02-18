import Guide from "@/components/Guide";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import Features from "@/components/Features";
import GetStarted from "@/components/GetStarted";

import AppLayout from "@/components/AppLayout";

function App() {
  return (
    <AppLayout>
      <Hero />
      <Guide />
      <FeaturedSection />
      <Features />
      <GetStarted />
      </AppLayout>
  );
}

export default App;