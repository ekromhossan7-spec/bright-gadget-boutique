import { Link, useSearchParams } from "react-router-dom";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Phone, MapPin, CreditCard, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  order_number: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_charge: number;
  partial_payment: number | null;
  total: number;
  items: any[];
  shipping_address: any;
  created_at: string;
  notes: string | null;
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "N/A";
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderNumber === "N/A") { setLoading(false); return; }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();
      if (data) setOrder(data as OrderData);
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your order and will begin processing it soon.
            </p>
          </motion.div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-2xl overflow-hidden mb-8"
          >
            {/* Order Header */}
            <div className="bg-secondary/50 p-6 border-b">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Order Number</p>
                  <p className="font-bold text-accent">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <p className="font-medium text-accent capitalize">{order?.order_status || "Confirmed"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Payment</p>
                  <p className="font-medium capitalize">{order?.payment_method === "cod" ? "Cash on Delivery" : order?.payment_method === "partial" ? "Partial Payment" : order?.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Est. Delivery</p>
                  <p className="font-medium">2-5 Business Days</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order?.items && Array.isArray(order.items) && order.items.length > 0 && (
              <div className="p-6 border-b">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-accent" /> Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-secondary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-sm">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {order && (
              <div className="p-6 border-b">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" /> Payment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery_charge === 0 ? "Free" : `৳${order.delivery_charge}`}</span></div>
                  {order.partial_payment ? (
                    <div className="flex justify-between text-accent"><span>Paid (10%)</span><span>৳{order.partial_payment.toLocaleString()}</span></div>
                  ) : null}
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total</span><span>৳{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order?.shipping_address && (
              <div className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" /> Shipping Address
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{(order.shipping_address as any).name}</p>
                  <p>{(order.shipping_address as any).phone}</p>
                  <p>{(order.shipping_address as any).address}{(order.shipping_address as any).area ? `, ${(order.shipping_address as any).area}` : ""}</p>
                  <p>{(order.shipping_address as any).city}</p>
                </div>
              </div>
            )}

            {!order && !loading && (
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Order Number</span><span className="font-bold text-accent">{orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-accent">Confirmed</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated Delivery</span><span className="font-medium">2-5 Business Days</span></div>
              </div>
            )}
          </motion.div>

          {/* Help */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Phone className="h-4 w-4" />
            <span>Need help? Call us at <a href="tel:+8801835925510" className="text-accent font-medium">+88 01835 925510</a></span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/shop"><Package className="mr-2 h-4 w-4" /> Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
