import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { FileText } from "lucide-react";

const TermsConditions = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar /><Header />
    <main className="flex-1 py-10">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><FileText className="h-6 w-6 text-primary" /></div>
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
        </div>
        <div className="prose max-w-none space-y-6">
          <section><h2 className="text-xl font-bold">General</h2><p className="text-muted-foreground">By using Best E-Shop, you agree to these terms. We reserve the right to update them at any time.</p></section>
          <section><h2 className="text-xl font-bold">Products & Pricing</h2><p className="text-muted-foreground">All prices are in BDT (৳). We strive for accuracy but reserve the right to correct pricing errors. Product availability is subject to change.</p></section>
          <section><h2 className="text-xl font-bold">Orders & Payment</h2><p className="text-muted-foreground">Orders are confirmed via email/SMS. We accept Cash on Delivery and online payments. Orders may be cancelled if fraud is suspected.</p></section>
          <section><h2 className="text-xl font-bold">Shipping & Delivery</h2><p className="text-muted-foreground">Delivery times vary by location. We are not responsible for delays caused by third-party couriers or natural disasters.</p></section>
          <section><h2 className="text-xl font-bold">Returns & Refunds</h2><p className="text-muted-foreground">Please refer to our Return Policy page for detailed return and refund information.</p></section>
          <section><h2 className="text-xl font-bold">Limitation of Liability</h2><p className="text-muted-foreground">Best E-Shop shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p></section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsConditions;
