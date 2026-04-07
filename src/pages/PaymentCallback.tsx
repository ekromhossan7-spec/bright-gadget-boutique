import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoice_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!invoiceId) {
        setStatus("failed");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("uddoktapay", {
          body: { invoice_id: invoiceId },
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        // Build proper URL with query param
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const functionUrl = `https://${projectId}.supabase.co/functions/v1/uddoktapay?action=verify-payment`;

        const res = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ invoice_id: invoiceId }),
        });

        const result = await res.json();

        if (result.status === "COMPLETED") {
          setStatus("success");
          setOrderNumber(result.metadata?.order_number || "");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [invoiceId]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">Your payment has been verified and your order is confirmed.</p>
              <Button asChild className="rounded-full">
                <Link to={`/order-success?order=${orderNumber}`}>View Order Details</Link>
              </Button>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">We couldn't verify your payment. Please try again or contact support.</p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="rounded-full">
                  <Link to="/checkout">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/">Go Home</Link>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallback;
