import HeaderSettings from "@/components/admin/settings/HeaderSettings";
import FooterSettings from "@/components/admin/settings/FooterSettings";
import InvoiceSettings from "@/components/admin/settings/InvoiceSettings";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Global site settings. For home page customization, go to{" "}
        <a href="/admin/pages" className="text-primary underline">Pages → Home</a>.
      </p>

      <HeaderSettings />
      <FooterSettings />
      <InvoiceSettings />
    </div>
  );
};

export default AdminSettings;
