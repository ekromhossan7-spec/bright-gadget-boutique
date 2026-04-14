import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STEADFAST_BASE = "https://portal.packzy.com/api/v1";

async function steadfastFetch(path: string, options: RequestInit = {}) {
  const apiKey = Deno.env.get("STEADFAST_API_KEY");
  const secretKey = Deno.env.get("STEADFAST_SECRET_KEY");

  if (!apiKey || !secretKey) {
    console.error("Missing STEADFAST_API_KEY or STEADFAST_SECRET_KEY");
    throw new Error("Steadfast API credentials not configured");
  }

  console.log(`Steadfast request: ${options.method || "GET"} ${STEADFAST_BASE}${path}`);

  const res = await fetch(`${STEADFAST_BASE}${path}`, {
    ...options,
    headers: {
      "Api-Key": apiKey,
      "Secret-Key": secretKey,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const responseText = await res.text();
  console.log(`Steadfast response status: ${res.status}, body: ${responseText.substring(0, 500)}`);

  if (!res.ok) {
    throw new Error(`Steadfast API error (${res.status}): ${responseText.substring(0, 300)}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`Steadfast API returned non-JSON: ${responseText.substring(0, 300)}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser(token);

    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { action, order_ids } = await req.json();

    // ACTION: send_single - send one order to Steadfast
    if (action === "send_single" && order_ids?.length === 1) {
      const { data: order } = await supabase.from("orders").select("*").eq("id", order_ids[0]).single();
      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });
      }

      const addr = order.shipping_address as any;
      const result = await steadfastFetch("/create_order", {
        method: "POST",
        body: JSON.stringify({
          invoice: order.order_number,
          recipient_name: addr?.name || "Customer",
          recipient_phone: order.guest_phone || "01700000000",
          recipient_address: `${addr?.address || ""}, ${addr?.area || ""}, ${addr?.city || ""}`.trim(),
          cod_amount: order.payment_method === "cod" ? Number(order.total) : 0,
          note: order.notes || "",
        }),
      });

      if (result.status === 200 && result.consignment) {
        await supabase.from("orders").update({
          consignment_id: String(result.consignment.consignment_id),
          tracking_code: result.consignment.tracking_code,
          courier_status: result.consignment.status || "in_review",
          order_status: "processing",
          updated_at: new Date().toISOString(),
        }).eq("id", order.id);
      }

      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ACTION: send_bulk - send multiple orders to Steadfast
    if (action === "send_bulk" && order_ids?.length > 0) {
      const { data: orders } = await supabase.from("orders").select("*").in("id", order_ids);
      if (!orders?.length) {
        return new Response(JSON.stringify({ error: "No orders found" }), { status: 404, headers: corsHeaders });
      }

      // Filter out already sent orders
      const unsent = orders.filter(o => !o.consignment_id);
      if (!unsent.length) {
        return new Response(JSON.stringify({ error: "All selected orders already sent to courier" }), { status: 400, headers: corsHeaders });
      }

      const data = unsent.map(order => {
        const addr = order.shipping_address as any;
        return {
          invoice: order.order_number,
          recipient_name: addr?.name || "Customer",
          recipient_phone: order.guest_phone || "01700000000",
          recipient_address: `${addr?.address || ""}, ${addr?.area || ""}, ${addr?.city || ""}`.trim(),
          cod_amount: order.payment_method === "cod" ? Number(order.total) : 0,
          note: order.notes || "",
        };
      });

      const result = await steadfastFetch("/create_order/bulk-order", {
        method: "POST",
        body: JSON.stringify({ data: JSON.stringify(data) }),
      });

      // Update orders with consignment info from bulk response
      const responseData = Array.isArray(result) ? result : (result.data || []);
      for (const item of responseData) {
        if (item.status === "success" && item.consignment_id) {
          const matchedOrder = unsent.find(o => o.order_number === item.invoice);
          if (matchedOrder) {
            await supabase.from("orders").update({
              consignment_id: String(item.consignment_id),
              tracking_code: item.tracking_code,
              courier_status: "in_review",
              order_status: "processing",
              updated_at: new Date().toISOString(),
            }).eq("id", matchedOrder.id);
          }
        }
      }

      return new Response(JSON.stringify({ results: responseData, sent: unsent.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ACTION: sync_status - check delivery status for orders with consignment_id
    if (action === "sync_status") {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, consignment_id, tracking_code, courier_status, order_status")
        .not("consignment_id", "is", null)
        .not("order_status", "eq", "delivered")
        .not("order_status", "eq", "cancelled");

      if (!orders?.length) {
        return new Response(JSON.stringify({ message: "No orders to sync", updated: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let updated = 0;
      for (const order of orders) {
        try {
          const result = await steadfastFetch(`/status_by_cid/${order.consignment_id}`);
          if (result.status === 200 && result.delivery_status) {
            const newCourierStatus = result.delivery_status;
            if (newCourierStatus !== order.courier_status) {
              const updateData: any = { courier_status: newCourierStatus, updated_at: new Date().toISOString() };
              
              // Auto-update order status based on courier status
              if (newCourierStatus === "delivered" || newCourierStatus === "delivered_approval_pending") {
                updateData.order_status = "delivered";
                if (updateData.order_status === "delivered") updateData.payment_status = "paid";
              } else if (newCourierStatus === "cancelled" || newCourierStatus === "cancelled_approval_pending") {
                updateData.order_status = "cancelled";
              } else if (newCourierStatus === "in_review" || newCourierStatus === "pending") {
                updateData.order_status = "processing";
              }

              await supabase.from("orders").update(updateData).eq("id", order.id);
              updated++;
            }
          }
        } catch {
          // Skip individual failures
        }
      }

      return new Response(JSON.stringify({ message: `Synced ${updated} order(s)`, updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error("Steadfast courier error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
