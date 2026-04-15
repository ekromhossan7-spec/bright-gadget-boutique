import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.jpg";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterData {
  description: string;
  quickLinks: FooterLink[];
  serviceLinks: FooterLink[];
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  youtube: string;
  copyright: string;
}

const defaultFooter: FooterData = {
  description: "Enjoy new gadgets with a touch of technology. Your trusted destination for premium gadgets in Bangladesh.",
  quickLinks: [
    { label: "Shop All", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  serviceLinks: [
    { label: "Track Order", href: "/track-order" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Shipping Info", href: "/shipping-info" },
    { label: "FAQ", href: "/faq" },
  ],
  phone: "+88 01835 925510",
  email: "support@techllect.com",
  address: "Dhaka, Bangladesh",
  facebook: "https://www.facebook.com/Techllect/",
  instagram: "",
  youtube: "",
  copyright: "© {year} Best E-Shop. All rights reserved Ekrom Hossan (Software Developer)",
};

const Footer = () => {
  const [footer, setFooter] = useState<FooterData>(defaultFooter);
  const [storeName, setStoreName] = useState("Best E-Shop");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["footer_settings", "header_store_name", "header_logo"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "footer_settings" && typeof row.value === "object") {
            setFooter(prev => ({ ...prev, ...(row.value as unknown as FooterData) }));
          }
          if (row.key === "header_store_name" && typeof row.value === "string") setStoreName(row.value);
          if (row.key === "header_logo" && typeof row.value === "string" && row.value) setLogoUrl(row.value);
        });
      }
    };
    fetchSettings();
  }, []);

  const logo = logoUrl || defaultLogo;
  const copyrightText = footer.copyright.replace("{year}", String(new Date().getFullYear()));

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt={storeName} className="h-11 w-11 rounded-full object-cover border-2 border-accent" />
              <span className="font-display font-bold text-xl">{storeName}</span>
            </div>
            <p className="text-primary-foreground/60 text-sm mb-4 leading-relaxed">{footer.description}</p>
            <div className="flex gap-3">
              {footer.facebook && (
                <a href={footer.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {footer.instagram && (
                <a href={footer.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {footer.youtube && (
                <a href={footer.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              {footer.quickLinks.map((link) => (
                <li key={link.href}><Link to={link.href} className="hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              {footer.serviceLinks.map((link) => (
                <li key={link.href}><Link to={link.href} className="hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              {footer.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <a href={`tel:${footer.phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors">{footer.phone}</a>
                </li>
              )}
              {footer.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  {footer.email}
                </li>
              )}
              {footer.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-accent mt-0.5" />
                  {footer.address}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 text-center text-sm text-primary-foreground/40">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
