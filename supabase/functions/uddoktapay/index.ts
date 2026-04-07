import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UDDOKTAPAY_BASE_URL = "https://techllect.paymently.io/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const UDDOKTAPAY_API_KEY = Deno.env.get("UDDOKTAPAY_API_KEY");
  if (!UDDOKTAPAY_API_KEY) {
    return new Response(
      JSON.stringify({ error: "UDDOKTAPAY_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (action === "create-charge") {
      const body = await req.json();
      const { full_name, email, amount, metadata, redirect_url, cancel_url } = body;

      if (!full_name || !email || !amount || !redirect_url || !cancel_url) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: full_name, email, amount, redirect_url, cancel_url" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
        },
        body: JSON.stringify({
          full_name,
          email,
          amount: String(amount),
          metadata: metadata || {},
          redirect_url,
          return_type: "GET",
          cancel_url,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify-payment") {
      const body = await req.json();
      const { invoice_id } = body;

      if (!invoice_id) {
        return new Response(
          JSON.stringify({ error: "Missing invoice_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${UDDOKTAPAY_BASE_URL}/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
        },
        body: JSON.stringify({ invoice_id }),
      });

      const data = await response.json();

      // If payment is completed, update the order
      if (data.status === "COMPLETED" && data.metadata?.order_number) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", data.metadata.order_number);
      }

      return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use ?action=create-charge or ?action=verify-payment" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
