import { useState } from "react";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock, Truck, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber.trim())
      .single();
    setOrder(data);
    setLoading(false);
  };

  const getStepIndex = (status: string) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="container max-w-xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Track Your Order</h1>
          <p className="text-muted-foreground text-center mb-8">Enter your order number to see the latest status.</p>

          <form onSubmit={handleTrack} className="flex gap-2 mb-10">
            <Input placeholder="e.g. TL-XXXXXXXX" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={loading} className="rounded-full px-6">
              <Search className="h-4 w-4 mr-2" /> Track
            </Button>
          </form>

          {loading && <p className="text-center text-muted-foreground">Searching...</p>}

          {!loading && searched && !order && (
            <div className="text-center py-12 border rounded-2xl">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No order found</p>
              <p className="text-sm text-muted-foreground">Please check your order number and try again.</p>
            </div>
          )}

          {order && (
            <div className="border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <p className="font-bold text-accent">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold">৳{order.total?.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-0">
                {statusSteps.map((step, idx) => {
                  const currentIdx = getStepIndex(order.order_status);
                  const isComplete = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"} ${isCurrent ? "ring-2 ring-accent ring-offset-2" : ""}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-8 ${idx < currentIdx ? "bg-accent" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
