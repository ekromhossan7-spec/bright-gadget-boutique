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
import { CreditCard, Banknote, Wallet, Tag, X } from "lucide-react";

let UDDOKTAPAY_BASE_URL = "https://techllect.paymently.io/api";
let UDDOKTAPAY_API_KEY = "fIL1lgMDoHrDdaokBrXv30dKMAVACuW0lVxDjK25";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentMode, setPaymentMode] = useState<"client" | "server">("server");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", area: "", notes: "",
  });

  const [shippingZone, setShippingZone] = useState("inside_dhaka");
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [shippingRates, setShippingRates] = useState({ inside_dhaka: 60, outside_dhaka: 120, free_threshold: 5000 });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number; id: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [uddoktapayEnabled, setUddoktapayEnabled] = useState(true);
  const [partialPercent, setPartialPercent] = useState(5);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["free_delivery", "shipping_rates", "payment_settings"]);
      if (data) {
        for (const row of data) {
          if (row.key === "free_delivery" && typeof row.value === "object" && row.value !== null && "enabled" in row.value) {
            setFreeDeliveryEnabled((row.value as { enabled: boolean }).enabled);
          }
          if (row.key === "shipping_rates" && typeof row.value === "object" && row.value !== null) {
            const v = row.value as any;
            setShippingRates({
              inside_dhaka: v.inside_dhaka ?? 60,
              outside_dhaka: v.outside_dhaka ?? 120,
              free_threshold: v.free_threshold ?? 5000,
            });
          }
          if (row.key === "payment_settings" && typeof row.value === "object" && row.value !== null) {
            const ps = row.value as any;
            if (ps.cod_enabled !== undefined) setCodEnabled(ps.cod_enabled);
            if (ps.uddoktapay_enabled !== undefined) setUddoktapayEnabled(ps.uddoktapay_enabled);
            if (ps.partial_payment_percentage) setPartialPercent(ps.partial_payment_percentage);
            if (ps.uddoktapay_api_url) UDDOKTAPAY_BASE_URL = ps.uddoktapay_api_url;
            if (ps.uddoktapay_api_key) UDDOKTAPAY_API_KEY = ps.uddoktapay_api_key;
          }
        }
      }
    };
    fetchSettings();
  }, []);

  const deliveryCharge = freeDeliveryEnabled ? 0 : (totalPrice >= shippingRates.free_threshold ? 0 : shippingZone === "inside_dhaka" ? shippingRates.inside_dhaka : shippingRates.outside_dhaka);
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round(totalPrice * appliedCoupon.discount_value / 100)
      : Math.min(appliedCoupon.discount_value, totalPrice)
    : 0;
  const discountedSubtotal = Math.max(0, totalPrice - couponDiscount);
  const partialPayment = paymentMethod === "partial" ? Math.ceil((discountedSubtotal + deliveryCharge) * (partialPercent / 100)) : 0;
  const grandTotal = discountedSubtotal + deliveryCharge;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase().trim())
      .eq("active", true)
      .single();

    setCouponLoading(false);
    if (error || !data) { toast.error("Invalid coupon code"); return; }
    if (data.starts_at && new Date(data.starts_at) > new Date()) { toast.error("This coupon is not active yet"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("This coupon has expired"); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { toast.error("This coupon has reached its usage limit"); return; }
    if (data.min_order_amount && totalPrice < data.min_order_amount) { toast.error(`Minimum order ৳${data.min_order_amount} required`); return; }

    setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value, id: data.id });
    toast.success(`Coupon "${data.code}" applied!`);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); };

  const { markCompleted } = useAbandonedCheckout(form, paymentMethod, items, totalPrice, deliveryCharge, grandTotal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createOrderInDB = async (orderNumber: string, paymentStatus: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("orders").insert({
      order_number: orderNumber,
      user_id: user?.user?.id || null,
      guest_email: form.email,
      guest_phone: form.phone,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, ...(i.color ? { color: i.color } : {}), ...(i.size ? { size: i.size } : {}) })),
      subtotal: totalPrice,
      delivery_charge: deliveryCharge,
      partial_payment: partialPayment,
      total: grandTotal,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: "pending",
      shipping_address: { name: form.name, phone: form.phone, address: form.address, city: form.city, area: form.area },
      notes: form.notes + (appliedCoupon ? ` | Coupon: ${appliedCoupon.code} (-৳${couponDiscount})` : ""),
    });
    if (error) throw error;

    if (appliedCoupon) {
      await supabase.rpc("increment_coupon_usage" as any, { _coupon_id: appliedCoupon.id });
    }
  };

  const initiateUddoktaPayClient = async (orderNumber: string, amount: number) => {
    const siteUrl = window.location.origin;
    const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify({
        full_name: form.name,
        email: form.email || "customer@store.com",
        amount: String(amount),
        metadata: { order_number: orderNumber },
        redirect_url: `${siteUrl}/payment-callback`,
        return_type: "GET",
        cancel_url: `${siteUrl}/checkout`,
      }),
    });

    const data = await response.json();
    if (data.status && data.payment_url) {
      return data.payment_url;
    }
    throw new Error(data.message || "Failed to create payment");
  };

  const initiateUddoktaPayServer = async (orderNumber: string, amount: number) => {
    const siteUrl = window.location.origin;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const functionUrl = `https://${projectId}.supabase.co/functions/v1/uddoktapay?action=create-charge`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        full_name: form.name,
        email: form.email || "customer@store.com",
        amount: String(amount),
        metadata: { order_number: orderNumber },
        redirect_url: `${siteUrl}/payment-callback`,
        cancel_url: `${siteUrl}/checkout`,
      }),
    });

    const data = await response.json();
    if (data.status && data.payment_url) {
      return data.payment_url;
    }
    throw new Error(data.message || "Failed to create payment");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Check stock
      const productIds = items.map(i => i.id);
      const { data: products } = await supabase.from("products").select("id, name, in_stock, stock_quantity").in("id", productIds);
      if (products) {
        const outOfStock = products.filter(p => !p.in_stock);
        if (outOfStock.length > 0) {
          toast.error(`Out of stock: ${outOfStock.map(p => p.name).join(", ")}`);
          setLoading(false);
          return;
        }
      }

      const orderNumber = `TL-${Date.now().toString(36).toUpperCase()}`;

      if (paymentMethod === "cod") {
        await createOrderInDB(orderNumber, "pending");
        await markCompleted();
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/order-success?order=${orderNumber}`);
      } else {
        // Online payment (full or partial)
        const payAmount = paymentMethod === "partial" ? partialPayment : grandTotal;
        await createOrderInDB(orderNumber, "awaiting_payment");

        let paymentUrl: string;
        if (paymentMode === "client") {
          paymentUrl = await initiateUddoktaPayClient(orderNumber, payAmount);
        } else {
          paymentUrl = await initiateUddoktaPayServer(orderNumber, payAmount);
        }

        await markCompleted();
        clearCart();
        // Open in top-level window (avoids iframe blocking in preview)
        if (window.top) {
          window.top.location.href = paymentUrl;
        } else {
          window.open(paymentUrl, "_blank");
        }
      }
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
                            <p className="text-sm text-muted-foreground">{freeDeliveryEnabled ? "Free" : `৳${shippingRates.inside_dhaka}`} (1-2 days)</p>
                          </Label>
                        </div>
                        <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer flex-1 ${shippingZone === "outside_dhaka" ? "border-primary bg-primary/5" : "hover:bg-secondary/50"}`}>
                          <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                          <Label htmlFor="outside_dhaka" className="cursor-pointer">
                            <span className="font-medium">Outside Dhaka</span>
                            <p className="text-sm text-muted-foreground">{freeDeliveryEnabled ? "Free" : `৳${shippingRates.outside_dhaka}`} (3-5 days)</p>
                          </Label>
                        </div>
                      </RadioGroup>
                      {freeDeliveryEnabled && <p className="text-sm text-green-600 mt-2 font-medium">🎉 Free delivery on all orders!</p>}
                      {!freeDeliveryEnabled && totalPrice >= shippingRates.free_threshold && <p className="text-sm text-green-600 mt-2 font-medium">🎉 Free shipping on orders above ৳{shippingRates.free_threshold.toLocaleString()}!</p>}
                    </div>
                    <div className="sm:col-span-2"><Label htmlFor="notes">Order Notes</Label><Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Special delivery instructions..." /></div>
                  </div>
                </div>

                <div className="border rounded-xl p-6">
                  <h2 className="font-bold text-lg mb-4">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {codEnabled && (
                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-accent bg-accent/5" : "hover:bg-secondary/50"}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1 flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Cash on Delivery</span>
                          <p className="text-sm text-muted-foreground">Pay when you receive</p>
                        </div>
                      </Label>
                    </div>
                    )}
                    {uddoktapayEnabled && (
                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "online" ? "border-accent bg-accent/5" : "hover:bg-secondary/50"}`}>
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="cursor-pointer flex-1 flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Online Payment (Full)</span>
                          <p className="text-sm text-muted-foreground">Pay ৳{grandTotal.toLocaleString()} via bKash/Nagad/Rocket/Bank</p>
                        </div>
                      </Label>
                    </div>
                    )}
                    {uddoktapayEnabled && (
                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "partial" ? "border-accent bg-accent/5" : "hover:bg-secondary/50"}`}>
                      <RadioGroupItem value="partial" id="partial" />
                      <Label htmlFor="partial" className="cursor-pointer flex-1 flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Online Partial Payment ({partialPercent}%)</span>
                          <p className="text-sm text-muted-foreground">Pay ৳{Math.ceil(grandTotal * (partialPercent / 100)).toLocaleString()} now, rest on delivery</p>
                        </div>
                      </Label>
                    </div>
                    )}
                  </RadioGroup>

                  {/* Processing mode toggle for online payments */}
                  {(paymentMethod === "online" || paymentMethod === "partial") && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground mb-2 block">Payment Processing Mode</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={paymentMode === "server" ? "default" : "outline"}
                          onClick={() => setPaymentMode("server")}
                          className="rounded-full text-xs"
                        >
                          🔒 Server-side (Recommended)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={paymentMode === "client" ? "default" : "outline"}
                          onClick={() => setPaymentMode("client")}
                          className="rounded-full text-xs"
                        >
                          ⚡ Client-side (Fast)
                        </Button>
                      </div>
                    </div>
                  )}
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
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium"><span>Coupon ({appliedCoupon?.code})</span><span>-৳{couponDiscount.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryCharge === 0 ? "Free" : `৳${deliveryCharge}`}</span></div>
                    {paymentMethod === "partial" && (
                      <div className="flex justify-between text-accent font-medium"><span>Pay Now (5%)</span><span>৳{partialPayment.toLocaleString()}</span></div>
                    )}
                    {paymentMethod === "online" && (
                      <div className="flex justify-between text-accent font-medium"><span>Pay Now (Full)</span><span>৳{grandTotal.toLocaleString()}</span></div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>৳{grandTotal.toLocaleString()}</span></div>
                  </div>

                  {/* Coupon Code */}
                  <div className="border-t pt-4 mt-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                          <span className="text-xs text-green-600">(-৳{couponDiscount.toLocaleString()})</span>
                        </div>
                        <button type="button" onClick={removeCoupon}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="text-sm" />
                        <Button type="button" variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading} className="rounded-full whitespace-nowrap">
                          {couponLoading ? "..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full mt-6 rounded-full" size="lg" disabled={loading}>
                    {loading
                      ? "Processing..."
                      : paymentMethod === "cod"
                        ? "Place Order"
                        : paymentMethod === "partial"
                          ? `Pay ৳${partialPayment.toLocaleString()} & Place Order`
                          : `Pay ৳${grandTotal.toLocaleString()} & Place Order`}
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
