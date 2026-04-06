import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let sid = sessionStorage.getItem("checkout_session_id");
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("checkout_session_id", sid);
  }
  return sid;
}

export function useAbandonedCheckout(
  form: { name: string; email: string; phone: string; address: string; city: string; area: string; notes: string },
  paymentMethod: string,
  items: any[],
  totalPrice: number,
  deliveryCharge: number,
  grandTotal: number
) {
  const sessionId = useRef(getSessionId());
  const savedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasData = form.name || form.email || form.phone || form.address || form.city;

  const saveCheckout = useCallback(async () => {
    if (!hasData) return;

    const payload = {
      session_id: sessionId.current,
      name: form.name || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      area: form.area || null,
      notes: form.notes || null,
      payment_method: paymentMethod,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      subtotal: totalPrice,
      delivery_charge: deliveryCharge,
      total: grandTotal,
      updated_at: new Date().toISOString(),
    };

    if (!savedRef.current) {
      // First save - insert
      const { data: user } = await supabase.auth.getUser();
      await supabase.from("abandoned_checkouts").insert({
        ...payload,
        user_id: user?.user?.id || null,
        status: "abandoned",
      });
      savedRef.current = true;
    } else {
      // Update existing
      await supabase
        .from("abandoned_checkouts")
        .update(payload)
        .eq("session_id", sessionId.current)
        .eq("status", "abandoned");
    }
  }, [form, paymentMethod, items, totalPrice, deliveryCharge, grandTotal, hasData]);

  // Debounced save on form changes
  useEffect(() => {
    if (!hasData || items.length === 0) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(saveCheckout, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [saveCheckout, hasData, items.length]);

  // Mark as completed when order is placed
  const markCompleted = useCallback(async () => {
    if (savedRef.current) {
      await supabase
        .from("abandoned_checkouts")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("session_id", sessionId.current);
    }
    sessionStorage.removeItem("checkout_session_id");
  }, []);

  return { markCompleted };
}
