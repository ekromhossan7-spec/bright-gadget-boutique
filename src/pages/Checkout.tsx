import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import TopBar from "@/components/store/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAbandonedCheckout } from "@/hooks/use-abandoned-checkout";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", area: "", notes: "",
  });

  const [shippingZone, setShippingZone] = useState("inside_dhaka");
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "free_delivery")
        .maybeSingle();
      if (data?.value && typeof data.value === "object" && "enabled" in data.value) {
        setFreeDeliveryEnabled((data.value as { enabled: boolean }).enabled);
      }
    };
    fetchSetting();
  }, []);

  const deliveryCharge = freeDeliveryEnabled ? 0 : (totalPrice >= 5000 ? 0 : shippingZone === "inside_dhaka" ? 60 : 120);
  const partialPayment = paymentMethod === "partial" ? Math.ceil((totalPrice + deliveryCharge) * 0.05) : 0;
  const grandTotal = totalPrice + deliveryCharge;

  const { markCompleted } = useAbandonedCheckout(form, paymentMethod, items, totalPrice, deliveryCharge, grandTotal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderNumber = `TL-${Date.now().toString(36).toUpperCase()}`;
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: user?.user?.id || null,
        guest_email: form.email,
        guest_phone: form.phone,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        subtotal: totalPrice,
        delivery_charge: deliveryCharge,
        partial_payment: partialPayment,
        total: grandTotal,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        shipping_address: { name: form.name, phone: form.phone, address: form.address, city: form.city, area: form.area },
        notes: form.notes,
      });

      if (error) throw error;

      await markCompleted();
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success?order=${orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar /><Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">No items to checkout</h1>
            <Button asChild className="rounded-full mt-4"><Link to="/shop">Go Shopping</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border rounded-xl p-6">
                  <h2 className="font-bold text-lg mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="name">Full Name *</Label><Input id="name" name="name" required value={form.name} onChange={handleChange} /></div>
                    <div><Label htmlFor="phone">Phone *</Label><Input id="phone" name="phone" required value={form.phone} onChange={handleChange} /></div>
                    <div className="sm:col-span-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} /></div>
                    <div className="sm:col-span-2"><Label htmlFor="address">Address *</Label><Input id="address" name="address" required value={form.address} onChange={handleChange} /></div>
                    <div><Label htmlFor="city">City *</Label><Input id="city" name="city" required value={form.city} onChange={handleChange} /></div>
                    <div><Label htmlFor="area">Area</Label><Input id="area" name="area" value={form.area} onChange={handleChange} /></div>
                    <div className="sm:col-span-2">
                      <Label className="mb-2 block">Shipping Zone *</Label>
                      <RadioGroup value={shippingZone} onValueChange={setShippingZone} className="flex flex-col sm:flex-row gap-3">
                        <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer flex-1 ${shippingZone === "inside_dhaka" ? "border-primary bg-primary/5" : "hover:bg-secondary/50"}`}>
                          <RadioGroupItem value="inside_dhaka" id="inside_dhaka" />
                          <Label htmlFor="inside_dhaka" className="cursor-pointer">
                            <span className="font-medium">Inside Dhaka</span>
                            <p className="text-sm text-muted-foreground">{freeDeliveryEnabled ? "Free" : "৳60"} (1-2 days)</p>
                          </Label>
                        </div>
                        <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer flex-1 ${shippingZone === "outside_dhaka" ? "border-primary bg-primary/5" : "hover:bg-secondary/50"}`}>
                          <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                          <Label htmlFor="outside_dhaka" className="cursor-pointer">
                            <span className="font-medium">Outside Dhaka</span>
                            <p className="text-sm text-muted-foreground">{freeDeliveryEnabled ? "Free" : "৳120"} (3-5 days)</p>
                          </Label>
                        </div>
                      </RadioGroup>
                      {freeDeliveryEnabled && <p className="text-sm text-green-600 mt-2 font-medium">🎉 Free delivery on all orders!</p>}
                      {!freeDeliveryEnabled && totalPrice >= 5000 && <p className="text-sm text-green-600 mt-2 font-medium">🎉 Free shipping on orders above ৳5,000!</p>}
                    </div>
                    <div className="sm:col-span-2"><Label htmlFor="notes">Order Notes</Label><Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Special delivery instructions..." /></div>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <h2 className="font-bold text-lg mb-4">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="partial" id="partial" />
                      <Label htmlFor="partial" className="cursor-pointer flex-1">
                        <span className="font-medium">Online Partial Payment (10%)</span>
                        <p className="text-sm text-muted-foreground">Pay ৳{Math.ceil(grandTotal * 0.1).toLocaleString()} now, rest on delivery</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="border rounded-xl p-6 sticky top-24">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 font-medium">{item.name}</p>
                          <p className="text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{totalPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryCharge === 0 ? "Free" : `৳${deliveryCharge}`}</span></div>
                    {paymentMethod === "partial" && (
                      <div className="flex justify-between text-accent font-medium"><span>Pay Now (10%)</span><span>৳{partialPayment.toLocaleString()}</span></div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>৳{grandTotal.toLocaleString()}</span></div>
                  </div>
                  <Button type="submit" className="w-full mt-6 rounded-full" size="lg" disabled={loading}>
                    {loading ? "Placing Order..." : paymentMethod === "partial" ? `Pay ৳${partialPayment.toLocaleString()} & Place Order` : "Place Order"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
