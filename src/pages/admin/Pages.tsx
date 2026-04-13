import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Info, Phone } from "lucide-react";
import HomePageSettings from "@/components/admin/settings/pages/HomePageSettings";
import AboutPageSettings from "@/components/admin/settings/pages/AboutPageSettings";
import ContactPageSettings from "@/components/admin/settings/pages/ContactPageSettings";

const AdminPages = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pages Management</h1>
        <p className="text-sm text-muted-foreground">Customize individual page content from here</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="home" className="gap-2"><Home className="h-4 w-4" />Home</TabsTrigger>
          <TabsTrigger value="about" className="gap-2"><Info className="h-4 w-4" />About</TabsTrigger>
          <TabsTrigger value="contact" className="gap-2"><Phone className="h-4 w-4" />Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6">
          <HomePageSettings />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutPageSettings />
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <ContactPageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPages;
