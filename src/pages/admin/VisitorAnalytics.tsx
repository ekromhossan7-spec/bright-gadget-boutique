import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Users, Eye, TrendingUp, Calendar } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

type View = { id: string; visitor_id: string; user_id: string | null; path: string; created_at: string };

const todayStr = () => new Date().toISOString().split("T")[0];
const daysAgoStr = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0];
};

const VisitorAnalytics = () => {
  const [mode, setMode] = useState<"day" | "month" | "year" | "range">("day");
  const [singleDate, setSingleDate] = useState(todayStr());
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [from, setFrom] = useState(daysAgoStr(7));
  const [to, setTo] = useState(todayStr());
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(false);

  const computeRange = (): { fromIso: string; toIso: string } => {
    if (mode === "day") {
      return {
        fromIso: new Date(singleDate + "T00:00:00").toISOString(),
        toIso: new Date(singleDate + "T23:59:59.999").toISOString(),
      };
    }
    if (mode === "month") {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      return { fromIso: start.toISOString(), toIso: end.toISOString() };
    }
    if (mode === "year") {
      const y = Number(year);
      return {
        fromIso: new Date(y, 0, 1).toISOString(),
        toIso: new Date(y, 11, 31, 23, 59, 59, 999).toISOString(),
      };
    }
    return {
      fromIso: new Date(from + "T00:00:00").toISOString(),
      toIso: new Date(to + "T23:59:59.999").toISOString(),
    };
  };

  const load = async () => {
    setLoading(true);
    try {
      const { fromIso, toIso } = computeRange();
      // Paginate to bypass 1000-row limit
      const all: View[] = [];
      let offset = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("page_views")
          .select("id,visitor_id,user_id,path,created_at")
          .gte("created_at", fromIso)
          .lte("created_at", toIso)
          .order("created_at", { ascending: true })
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as View[]));
        if (data.length < pageSize) break;
        offset += pageSize;
      }
      setViews(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [mode, singleDate, month, year, from, to]);

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(views.map(v => v.visitor_id)).size;
    const totalViews = views.length;
    const loggedIn = new Set(views.filter(v => v.user_id).map(v => v.user_id)).size;
    return { uniqueVisitors, totalViews, loggedIn };
  }, [views]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { key: string; visitors: Set<string>; views: number }>();
    const groupBy = mode === "year" ? "month" : mode === "month" ? "day" : mode === "day" ? "hour" : "day";

    views.forEach(v => {
      const d = new Date(v.created_at);
      let key = "";
      if (groupBy === "hour") key = `${String(d.getHours()).padStart(2, "0")}:00`;
      else if (groupBy === "day") key = d.toISOString().slice(0, 10);
      else key = d.toISOString().slice(0, 7);
      if (!buckets.has(key)) buckets.set(key, { key, visitors: new Set(), views: 0 });
      const b = buckets.get(key)!;
      b.visitors.add(v.visitor_id);
      b.views += 1;
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(b => ({ name: b.key, visitors: b.visitors.size, views: b.views }));
  }, [views, mode]);

  const topPages = useMemo(() => {
    const counts = new Map<string, number>();
    views.forEach(v => counts.set(v.path, (counts.get(v.path) || 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }, [views]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visitor Analytics</h1>
        <p className="text-sm text-muted-foreground">Track how many visitors come to your site by day, month, year, or custom range.</p>
      </div>

      <Card className="p-4">
        <Tabs value={mode} onValueChange={v => setMode(v as any)}>
          <TabsList className="grid grid-cols-4 max-w-md">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="range">Range</TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="mt-4">
            <div className="max-w-xs">
              <Label>Select Date</Label>
              <Input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
            </div>
          </TabsContent>
          <TabsContent value="month" className="mt-4">
            <div className="max-w-xs">
              <Label>Select Month</Label>
              <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
            </div>
          </TabsContent>
          <TabsContent value="year" className="mt-4">
            <div className="max-w-xs">
              <Label>Select Year</Label>
              <Input type="number" min="2020" max="2100" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </TabsContent>
          <TabsContent value="range" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <div><Label>From</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
              <div><Label>To</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4">
          <Button onClick={load} disabled={loading} size="sm">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="text-3xl font-bold mt-1">{stats.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-500/10"><Users className="h-5 w-5 text-emerald-500" /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Page Views</p>
              <p className="text-3xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10"><Eye className="h-5 w-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Logged-in Users</p>
              <p className="text-3xl font-bold mt-1">{stats.loggedIn.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10"><TrendingUp className="h-5 w-5 text-blue-500" /></div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-bold">Traffic over time</h3>
        </div>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No visits in this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} name="Unique Visitors" />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--accent-foreground))" strokeWidth={2} name="Page Views" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-bold mb-4">Top Pages</h3>
        {topPages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, topPages.length * 35)}>
            <BarChart data={topPages} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="path" tick={{ fontSize: 11 }} width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default VisitorAnalytics;
