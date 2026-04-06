import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const AdminPages = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Pages Management</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {["Home", "About", "Contact", "FAQ", "Privacy Policy", "Terms & Conditions", "Return Policy", "Shipping Info"].map((page) => (
        <Card key={page} className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><span className="font-medium">{page}</span></div>
          <span className="text-xs text-success font-medium">Published</span>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminPages;
