import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. Fill in your shipping details, choose your payment method, and confirm your order." },
  { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (COD) and partial online payment (10% upfront). More payment options including bKash and Nagad will be available soon." },
  { q: "How long does delivery take?", a: "Within Dhaka: 1-2 business days. Outside Dhaka: 3-5 business days. Remote areas may take an additional 1-2 days." },
  { q: "Is there free shipping?", a: "Yes! Orders above ৳5,000 qualify for free delivery anywhere in Bangladesh." },
  { q: "Can I return a product?", a: "Yes, we have a 7-day return policy. The product must be unused and in its original packaging. Contact us to initiate a return." },
  { q: "Are the products genuine?", a: "Absolutely. We only sell 100% genuine and authentic products. Every item comes with a manufacturer warranty where applicable." },
  { q: "How can I track my order?", a: "Visit our Track Order page and enter your order number to see real-time status updates." },
  { q: "What if I receive a damaged product?", a: "Contact us immediately at +88 01835 925510. We'll arrange a free replacement within 48 hours." },
];

const FAQ = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <Header />
    <main className="flex-1 py-12 sm:py-16">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-center mb-10">Find answers to common questions about our products and services.</p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-4">
              <AccordionTrigger className="text-left font-medium text-sm hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
    <Footer />
  </div>
);

export default FAQ;
