import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Printer } from "lucide-react";

interface InvoiceConfig {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  logo_url: string;
  footer_note: string;
  show_logo: boolean;
  show_delivery_charge: boolean;
  show_payment_method: boolean;
  show_notes: boolean;
  thank_you_message: string;
}

const defaultConfig: InvoiceConfig = {
  business_name: "My Store",
  business_address: "",
  business_phone: "",
  business_email: "",
  logo_url: "",
  footer_note: "",
  show_logo: true,
  show_delivery_charge: true,
  show_payment_method: true,
  show_notes: true,
  thank_you_message: "Thank you for your purchase!",
};

interface Props {
  order?: any;
  orders?: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SingleInvoice = ({ order, config }: { order: any; config: InvoiceConfig }) => {
  const addr = order.shipping_address as any;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div style={{ pageBreakAfter: "always", padding: "24px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, borderBottom: "2px solid #333", paddingBottom: 20 }}>
        <div>
          {config.show_logo && config.logo_url && (
            <img src={config.logo_url} alt="Logo" style={{ maxHeight: 50, marginBottom: 4 }} />
          )}
          <h1 style={{ fontSize: 22, fontWeight: "bold" }}>{config.business_name}</h1>
          {config.business_address && <p style={{ fontSize: 12, color: "#666", maxWidth: 250 }}>{config.business_address}</p>}
          {config.business_phone && <p style={{ fontSize: 12, color: "#666" }}>{config.business_phone}</p>}
          {config.business_email && <p style={{ fontSize: 12, color: "#666" }}>{config.business_email}</p>}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 28, fontWeight: "bold" }}>INVOICE</p>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            #{order.order_number}<br />
            Date: {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 25 }}>
        <div>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", color: "#999", letterSpacing: 1, marginBottom: 6 }}>Bill To</h3>
          <p style={{ fontWeight: 600 }}>{addr?.name || "Guest"}</p>
          {addr?.address && <p style={{ color: "#666" }}>{addr.address}</p>}
          {addr?.city && <p style={{ color: "#666" }}>{addr.city}{addr.area ? `, ${addr.area}` : ""}</p>}
          {order.guest_phone && <p style={{ color: "#666" }}>{order.guest_phone}</p>}
          {order.guest_email && <p style={{ color: "#666" }}>{order.guest_email}</p>}
        </div>
        <div style={{ textAlign: "right" }}>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", color: "#999", letterSpacing: 1, marginBottom: 6 }}>Order Info</h3>
          <p>Status: <strong style={{ textTransform: "capitalize" }}>{order.order_status}</strong></p>
          {config.show_payment_method && <p>Payment: <strong style={{ textTransform: "capitalize" }}>{order.payment_method}</strong> ({order.payment_status})</p>}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr>
            <th style={{ background: "#f5f5f5", padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid #ddd" }}>#</th>
            <th style={{ background: "#f5f5f5", padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid #ddd" }}>Product</th>
            <th style={{ background: "#f5f5f5", padding: "10px 12px", textAlign: "center", fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid #ddd" }}>Qty</th>
            <th style={{ background: "#f5f5f5", padding: "10px 12px", textAlign: "right", fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid #ddd" }}>Price</th>
            <th style={{ background: "#f5f5f5", padding: "10px 12px", textAlign: "right", fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid #ddd" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i}>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee" }}>{i + 1}</td>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee" }}>
                {item.name}
                {(item.color || item.size) && (
                  <span style={{ display: "block", fontSize: 11, color: "#888", marginTop: 2 }}>
                    {[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`].filter(Boolean).join(" · ")}
                  </span>
                )}
              </td>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{item.quantity}</td>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee", textAlign: "right" }}>৳{Number(item.price).toLocaleString()}</td>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee", textAlign: "right" }}>৳{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginLeft: "auto", width: 280 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span>Subtotal</span>
          <span>৳{Number(order.subtotal).toLocaleString()}</span>
        </div>
        {config.show_delivery_charge && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>Delivery Charge</span>
            <span>৳{Number(order.delivery_charge).toLocaleString()}</span>
          </div>
        )}
        {order.partial_payment > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#666" }}>
            <span>Partial Payment</span>
            <span>৳{Number(order.partial_payment).toLocaleString()}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", borderTop: "2px solid #333", fontWeight: "bold", fontSize: 16, marginTop: 6 }}>
          <span>Total</span>
          <span>৳{Number(order.total).toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      {config.show_notes && order.notes && (
        <div style={{ background: "#f9f9f9", padding: 12, borderRadius: 6, marginTop: 20, fontSize: 12 }}>
          <strong>Notes:</strong> {order.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#888", borderTop: "1px solid #eee", paddingTop: 20 }}>
        {config.thank_you_message && <p style={{ fontWeight: 600, marginBottom: 4 }}>{config.thank_you_message}</p>}
        {config.footer_note && <p>{config.footer_note}</p>}
      </div>
    </div>
  );
};

const OrderInvoice = ({ order, orders, open, onOpenChange }: Props) => {
  const allOrders = orders?.length ? orders : order ? [order] : [];
  const [config, setConfig] = useState<InvoiceConfig>(defaultConfig);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "invoice_config")
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value && typeof data.value === "object") {
            setConfig({ ...defaultConfig, ...(data.value as any) });
          }
        });
    }
  }, [open]);

  if (allOrders.length === 0) return null;

  const isBulk = allOrders.length > 1;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${isBulk ? `Invoices (${allOrders.length})` : `Invoice - ${allOrders[0].order_number}`}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ddd; }
            tbody td { padding: 10px 12px; border-bottom: 1px solid #eee; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isBulk ? `Invoices (${allOrders.length} orders)` : `Invoice - ${allOrders[0].order_number}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />Print / Save as PDF
          </Button>
        </div>

        <div ref={invoiceRef} className="bg-white text-black p-6 rounded-lg text-sm">
          {allOrders.map((o, idx) => (
            <SingleInvoice key={o.id || idx} order={o} config={config} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderInvoice;
