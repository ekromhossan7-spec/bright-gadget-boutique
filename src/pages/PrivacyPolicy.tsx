import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar /><Header />
    <main className="flex-1 py-10">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Shield className="h-6 w-6 text-primary" /></div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
        </div>
        <div className="prose max-w-none space-y-6">
          <section><h2 className="text-xl font-bold">Information We Collect</h2><p className="text-muted-foreground">We collect personal information you provide such as name, email, phone number, and shipping address when you create an account or place an order.</p></section>
          <section><h2 className="text-xl font-bold">How We Use Your Information</h2><p className="text-muted-foreground">Your information is used to process orders, provide customer support, send order updates, and improve our services. We do not sell your personal data.</p></section>
          <section><h2 className="text-xl font-bold">Data Security</h2><p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p></section>
          <section><h2 className="text-xl font-bold">Cookies</h2><p className="text-muted-foreground">We use cookies to enhance your browsing experience. You can disable cookies in your browser settings, but some features may not function properly.</p></section>
          <section><h2 className="text-xl font-bold">Contact Us</h2><p className="text-muted-foreground">For any privacy concerns, reach us at +88 01835 925510 or visit our Contact page.</p></section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
