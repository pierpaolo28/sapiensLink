import Guide from "@/components/Guide";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import Details from "@/components/Details";
import GetStarted from "@/components/GetStarted";

import AppLayout from "@/components/AppLayout";

function App() {
  return (
    <AppLayout>
      <Hero />
      <Guide />
      <FeaturedSection />
      <Details />
      <GetStarted />
      </AppLayout>
  );
}

export default App;