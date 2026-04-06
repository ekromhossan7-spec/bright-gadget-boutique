import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import HeroBanner from "@/components/store/HeroBanner";
import CategorySlider from "@/components/store/CategorySlider";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import PromoBanners from "@/components/store/PromoBanners";
import AllProducts from "@/components/store/AllProducts";
import CustomerReviews from "@/components/store/CustomerReviews";
import WhyChooseUs from "@/components/store/WhyChooseUs";
import MoneyBackBanner from "@/components/store/MoneyBackBanner";
import Footer from "@/components/store/Footer";

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
    </div>
  );
};

export default Index;
