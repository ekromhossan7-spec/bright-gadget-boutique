import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "visitor_id";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Skip admin routes from visitor analytics
    if (location.pathname.startsWith("/admin")) return;

    const track = async () => {
      try {
        const visitorId = getVisitorId();
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("page_views").insert({
          visitor_id: visitorId,
          user_id: user?.id || null,
          path: location.pathname + location.search,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch (e) {
        // silent fail - tracking should never break the app
      }
    };
    track();
  }, [location.pathname, location.search]);
}
