import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Target } from "lucide-react";

interface AbandonedCheckout {
  id: string;
  status: string;
  total: number;
  recovered_at: string | null;
  created_at: string;
}

const COLORS = ["hsl(var(--destructive))", "hsl(var(--primary))", "hsl(142 71% 45%)"];

const RecoveryAnalytics = () => {
  const [data, setData] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: rows } = await supabase
        .from("abandoned_checkouts")
        .select("id, status, total, recovered_at, created_at")
        .order("created_at", { ascending: true });
      setData((rows as AbandonedCheckout[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const abandoned = data.filter((d) => d.status === "abandoned");
    const recovered = data.filter((d) => d.status === "recovered");
    const completed = data.filter((d) => d.status === "completed");
    const totalAbandoned = data.filter((d) => d.status !== "completed").length;
    const recoveryRate = totalAbandoned > 0 ? (recovered.length / totalAbandoned) * 100 : 0;
    const recoveredRevenue = recovered.reduce((s, r) => s + Number(r.total), 0);
    const lostRevenue = abandoned.reduce((s, r) => s + Number(r.total), 0);

    return { abandoned: abandoned.length, recovered: recovered.length, completed: completed.length, recoveryRate, recoveredRevenue, lostRevenue, total: data.length };
  }, [data]);

  const funnelData = useMemo(() => [
    { name: "Started Checkout", value: data.filter((d) => d.status !== "completed").length, fill: "hsl(var(--primary))" },
    { name: "Abandoned", value: stats.abandoned, fill: "hsl(var(--destructive))" },
    { name: "Recovered", value: stats.recovered, fill: "hsl(142 71% 45%)" },
  ], [data, stats]);

  const pieData = useMemo(() => [
    { name: "Abandoned", value: stats.abandoned },
    { name: "Completed", value: stats.completed },
    { name: "Recovered", value: stats.recovered },
  ].filter((d) => d.value > 0), [stats]);

  const trendData = useMemo(() => {
    const byDay: Record<string, { date: string; abandoned: number; recovered: number; recoveredValue: number }> = {};
    data.forEach((d) => {
      const day = new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!byDay[day]) byDay[day] = { date: day, abandoned: 0, recovered: 0, recoveredValue: 0 };
      if (d.status === "abandoned") byDay[day].abandoned++;
      if (d.status === "recovered") { byDay[day].recovered++; byDay[day].recoveredValue += Number(d.total); }
    });
    return Object.values(byDay).slice(-14);
  }, [data]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recovery Analytics</h1>
        <p className="text-sm text-muted-foreground">Track abandoned checkout recovery performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recovery Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.recoveryRate.toFixed(1)}%</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recovered Revenue</p>
              <p className="text-2xl font-bold mt-1">৳{stats.recoveredRevenue.toLocaleString()}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orders Recovered</p>
              <p className="text-2xl font-bold mt-1">{stats.recovered}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lost Revenue</p>
              <p className="text-2xl font-bold mt-1">৳{stats.lostRevenue.toLocaleString()}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="p-5">
          <h3 className="font-bold mb-4">Recovery Trend (Last 14 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="abandoned" stroke="hsl(var(--destructive))" strokeWidth={2} name="Abandoned" />
                <Line type="monotone" dataKey="recovered" stroke="hsl(142 71% 45%)" strokeWidth={2} name="Recovered" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data yet</p>
          )}
        </Card>

        {/* Status Pie */}
        <Card className="p-5">
          <h3 className="font-bold mb-4">Checkout Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data yet</p>
          )}
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-bold mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default RecoveryAnalytics;
