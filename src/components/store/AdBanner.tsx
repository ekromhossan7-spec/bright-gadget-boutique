import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AdBannerData {
  imageUrl: string;
  linkUrl: string;
  altText: string;
  enabled: boolean;
}

const defaultAd: AdBannerData = {
  imageUrl: "",
  linkUrl: "/shop",
  altText: "Promotional Banner",
  enabled: false,
};

const AdBanner = () => {
  const [ad, setAd] = useState<AdBannerData>(defaultAd);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ad_banner")
        .maybeSingle();
      if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
        setAd(data.value as unknown as AdBannerData);
      }
    };
    fetch();
  }, []);

  if (!ad.enabled || !ad.imageUrl) return null;

  const content = (
    <img
      src={ad.imageUrl}
      alt={ad.altText}
      className="w-full h-auto rounded-xl object-cover"
      loading="lazy"
    />
  );

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 mt-4 mb-2">
      <div className="max-w-7xl mx-auto">
        {ad.linkUrl ? (
          <Link to={ad.linkUrl} className="block hover:opacity-95 transition-opacity">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </section>
  );
};

export default AdBanner;
