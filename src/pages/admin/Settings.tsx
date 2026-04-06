import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminSettings = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Settings</h1>
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Store Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Store Name</Label><Input defaultValue="Techllect" /></div>
        <div><Label>Phone</Label><Input defaultValue="+88 01835 925510" /></div>
        <div className="sm:col-span-2"><Label>Store Description</Label><Input defaultValue="Your Trusted Tech Companion" /></div>
      </div>
      <Button className="rounded-full" onClick={() => toast.success("Settings saved!")}>Save Changes</Button>
    </Card>
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Social Media Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Facebook</Label><Input defaultValue="https://www.facebook.com/Techllect/" /></div>
        <div><Label>Instagram</Label><Input placeholder="Instagram URL" /></div>
      </div>
      <Button className="rounded-full" onClick={() => toast.success("Social links saved!")}>Save Changes</Button>
    </Card>
  </div>
);

export default AdminSettings;
