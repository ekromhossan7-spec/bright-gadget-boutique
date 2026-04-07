import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Users, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: "", email: "", phone: "" });
  const [creating, setCreating] = useState(false);

  const fetchCustomers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setCustomers(data);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  const createCustomer = async () => {
    if (!newCustomer.full_name.trim()) { toast.error("Name is required"); return; }
    setCreating(true);

    // We create a profile entry directly (custom customer without auth account)
    const { error } = await supabase.from("profiles").insert({
      id: crypto.randomUUID(),
      full_name: newCustomer.full_name.trim(),
      email: newCustomer.email.trim() || null,
      phone: newCustomer.phone.trim() || null,
    });

    if (error) {
      toast.error("Failed to create customer: " + error.message);
    } else {
      toast.success("Customer created!");
      setCreateOpen(false);
      setNewCustomer({ full_name: "", email: "", phone: "" });
      fetchCustomers();
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{c.full_name || "No Name"}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{c.email || "N/A"}</td>
                <td className="p-3 text-muted-foreground">{c.phone || "N/A"}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={newCustomer.full_name} onChange={(e) => setNewCustomer(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter customer name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={newCustomer.email} onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))} placeholder="customer@email.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={newCustomer.phone} onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))} placeholder="+880..." />
            </div>
            <Button onClick={createCustomer} disabled={creating} className="w-full rounded-full">
              {creating ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
