import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) setCustomers(data);
    };
    fetch();
  }, []);

  const filtered = customers.filter((c) =>
    (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-secondary/50"><th className="text-left p-3 font-medium">Customer</th><th className="text-left p-3 font-medium">Email</th><th className="text-left p-3 font-medium">Phone</th><th className="text-left p-3 font-medium">Joined</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
                    <span className="font-medium">{c.full_name || "No Name"}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{c.email || "N/A"}</td>
                <td className="p-3 text-muted-foreground">{c.phone || "N/A"}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminCustomers;
