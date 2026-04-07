import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import HeroBanner from "@/components/store/HeroBanner";

import FeaturedProducts from "@/components/store/FeaturedProducts";
import PromoBanners from "@/components/store/PromoBanners";
import AllProducts from "@/components/store/AllProducts";
import CustomerReviews from "@/components/store/CustomerReviews";
import WhyChooseUs from "@/components/store/WhyChooseUs";
import MoneyBackBanner from "@/components/store/MoneyBackBanner";
import Footer from "@/components/store/Footer";
import LiveChat from "@/components/store/LiveChat";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <CategorySlider />
        <FeaturedProducts />
        <PromoBanners />
        <AllProducts />
        <CustomerReviews />
        <WhyChooseUs />
        <MoneyBackBanner />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
