import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FraudSignal {
  label: string;
  value: string;
  severity: "low" | "medium" | "high";
}

interface FraudResult {
  score: number; // 0-100, higher = riskier
  level: "safe" | "caution" | "risky";
  signals: FraudSignal[];
}

const HIGH_COD_THRESHOLD = 10000;
const RAPID_ORDER_HOURS = 24;
const RAPID_ORDER_COUNT = 3;

export function computeFraudScore(order: any, allOrders: any[]): FraudResult {
  const phone = order.guest_phone;
  const signals: FraudSignal[] = [];
  let score = 0;

  if (!phone) {
    return { score: 0, level: "safe", signals: [{ label: "No phone", value: "Cannot check", severity: "low" }] };
  }

  // All orders from same phone
  const phoneOrders = allOrders.filter(o => o.guest_phone === phone && !o.trashed_at);

  // 1. Cancelled order count
  const cancelledCount = phoneOrders.filter(o => o.order_status === "cancelled").length;
  if (cancelledCount >= 3) {
    score += 35;
    signals.push({ label: "Cancelled orders", value: `${cancelledCount} cancellations`, severity: "high" });
  } else if (cancelledCount >= 1) {
    score += 15;
    signals.push({ label: "Cancelled orders", value: `${cancelledCount} cancellation(s)`, severity: "medium" });
  }

  // 2. Delivery success rate
  const deliveredCount = phoneOrders.filter(o => o.order_status === "delivered").length;
  const totalCompleted = deliveredCount + cancelledCount;
  if (totalCompleted > 0) {
    const successRate = Math.round((deliveredCount / totalCompleted) * 100);
    if (successRate < 50 && totalCompleted >= 2) {
      score += 25;
      signals.push({ label: "Delivery rate", value: `${successRate}% (${deliveredCount}/${totalCompleted})`, severity: "high" });
    } else if (successRate < 75 && totalCompleted >= 2) {
      score += 10;
      signals.push({ label: "Delivery rate", value: `${successRate}% (${deliveredCount}/${totalCompleted})`, severity: "medium" });
    } else if (deliveredCount > 0) {
      signals.push({ label: "Delivery rate", value: `${successRate}% (${deliveredCount}/${totalCompleted})`, severity: "low" });
    }
  } else if (phoneOrders.length === 1) {
    signals.push({ label: "New customer", value: "First order", severity: "low" });
  }

  // 3. Rapid repeat orders (multiple orders within 24h)
  const orderTime = new Date(order.created_at).getTime();
  const recentOrders = phoneOrders.filter(o => {
    const t = new Date(o.created_at).getTime();
    return Math.abs(t - orderTime) < RAPID_ORDER_HOURS * 60 * 60 * 1000 && o.id !== order.id;
  });
  if (recentOrders.length >= RAPID_ORDER_COUNT) {
    score += 25;
    signals.push({ label: "Rapid orders", value: `${recentOrders.length + 1} orders in ${RAPID_ORDER_HOURS}h`, severity: "high" });
  } else if (recentOrders.length >= 1) {
    score += 5;
    signals.push({ label: "Repeat order", value: `${recentOrders.length + 1} orders in ${RAPID_ORDER_HOURS}h`, severity: "low" });
  }

  // 4. High COD amount
  if (order.payment_method === "cod" && Number(order.total) >= HIGH_COD_THRESHOLD) {
    score += 15;
    signals.push({ label: "High COD", value: `৳${Number(order.total).toLocaleString()}`, severity: "medium" });
  }

  const level = score >= 50 ? "risky" : score >= 20 ? "caution" : "safe";
  return { score: Math.min(score, 100), level, signals };
}

interface FraudBadgeProps {
  order: any;
  allOrders: any[];
}

export function FraudBadge({ order, allOrders }: FraudBadgeProps) {
  const fraud = useMemo(() => computeFraudScore(order, allOrders), [order, allOrders]);

  const config = {
    safe: { icon: ShieldCheck, className: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
    caution: { icon: Shield, className: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    risky: { icon: ShieldAlert, className: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  }[fraud.level];

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs cursor-help ${config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${config.className}`} />
          <span className={`font-medium ${config.className}`}>{fraud.score}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-64">
        <div className="space-y-1.5">
          <p className="font-semibold text-xs capitalize">Risk: {fraud.level} ({fraud.score}/100)</p>
          {fraud.signals.map((s, i) => (
            <div key={i} className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className={
                s.severity === "high" ? "text-red-500 font-medium" :
                s.severity === "medium" ? "text-yellow-500" : "text-muted-foreground"
              }>{s.value}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface FraudDetailProps {
  order: any;
  allOrders: any[];
}

export function FraudDetail({ order, allOrders }: FraudDetailProps) {
  const fraud = useMemo(() => computeFraudScore(order, allOrders), [order, allOrders]);

  const levelConfig = {
    safe: { label: "Low Risk", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" },
    caution: { label: "Medium Risk", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" },
    risky: { label: "High Risk", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" },
  }[fraud.level];

  return (
    <div className={`p-3 rounded-lg border ${levelConfig.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {fraud.level === "risky" ? <ShieldAlert className="h-4 w-4 text-red-500" /> :
           fraud.level === "caution" ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
           <ShieldCheck className="h-4 w-4 text-green-500" />}
          <span className={`font-semibold text-sm ${levelConfig.color}`}>{levelConfig.label}</span>
        </div>
        <Badge variant="outline" className="text-xs">{fraud.score}/100</Badge>
      </div>
      <div className="space-y-1">
        {fraud.signals.map((s, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{s.label}</span>
            <span className={
              s.severity === "high" ? "text-red-500 font-medium" :
              s.severity === "medium" ? "text-yellow-500 font-medium" : ""
            }>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
