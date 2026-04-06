import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { User, Package, MapPin, KeyRound, LogOut, Eye, EyeOff } from "lucide-react";

const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ address: "", city: "", area: "", zip: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) {
        setProfile({ full_name: p.full_name || "", email: p.email || "", phone: p.phone || "" });
        const addr = (p.address as any) || {};
        setAddress({ address: addr.address || "", city: addr.city || "", area: addr.area || "", zip: addr.zip || "" });
      }
      const { data: o } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (o) setOrders(o);
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      address: address,
    }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) { toast.error("Passwords don't match"); return; }
    if (passwords.new.length < 6) { toast.error("Min 6 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast.error(error.message);
    else { toast.success("Password changed!"); setPasswords({ current: "", new: "", confirm: "" }); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Logged out");
  };

  if (authLoading || !user) return null;

  const statusColor = (s: string) => {
    const map: Record<string, string> = { pending: "bg-warning/20 text-warning", processing: "bg-accent/20 text-accent", shipped: "bg-primary/20 text-primary", delivered: "bg-success/20 text-success", cancelled: "bg-destructive/20 text-destructive" };
    return map[s] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>
            <Button variant="outline" onClick={handleLogout} className="rounded-full"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="profile" className="text-xs sm:text-sm"><User className="h-4 w-4 mr-1 hidden sm:inline" />Profile</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm"><Package className="h-4 w-4 mr-1 hidden sm:inline" />Orders</TabsTrigger>
              <TabsTrigger value="address" className="text-xs sm:text-sm"><MapPin className="h-4 w-4 mr-1 hidden sm:inline" />Address</TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm"><KeyRound className="h-4 w-4 mr-1 hidden sm:inline" />Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="border rounded-xl p-6 space-y-4">
                <h2 className="font-bold text-lg">Profile Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label>Email</Label><Input value={user.email || ""} disabled className="bg-muted" /></div>
                </div>
                <Button onClick={handleSaveProfile} className="rounded-full" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="border rounded-xl p-6">
                <h2 className="font-bold text-lg mb-4">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
                    <Button asChild className="mt-4 rounded-full"><Link to="/shop">Start Shopping</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(order.order_status)}`}>{order.order_status}</span>
                          <span className="font-bold">৳{Number(order.total).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="address">
              <div className="border rounded-xl p-6 space-y-4">
                <h2 className="font-bold text-lg">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Label>Address</Label><Input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} /></div>
                  <div><Label>City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                  <div><Label>Area</Label><Input value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} /></div>
                  <div><Label>Zip Code</Label><Input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} /></div>
                </div>
                <Button onClick={handleSaveProfile} className="rounded-full" disabled={saving}>{saving ? "Saving..." : "Save Address"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="border rounded-xl p-6">
                <h2 className="font-bold text-lg mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input type={showPw ? "text" : "password"} required value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                  </div>
                  <Button type="submit" className="rounded-full" disabled={saving}>{saving ? "Changing..." : "Change Password"}</Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
