import Footer from "components/footer";
import DiscoverySection from "components/Home/DecovrirSection";
import FAQSection from "components/Home/FAQSection";
import Header from "components/Home/Header";
import HeroSection from "components/Home/hero";
import ExcellenceSection from "components/Home/section";
import SubscribeSection from "components/Home/SubscribeSection";
import React from "react";
import RivezliComponent from "test";


const Home: React.FC = () => {
  return (
    <>
      <Header />
      <HeroSection bgImage="/assets/a.png" />
      <DiscoverySection />
      <RivezliComponent />
      <ExcellenceSection />
      <FAQSection />
      <SubscribeSection />
      <Footer />
    </>
  );
};

export default Home;
