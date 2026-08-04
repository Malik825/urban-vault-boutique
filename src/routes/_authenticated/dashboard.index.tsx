import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  Download,
  Eye,
  MessageCircle,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { activity, brands, formatPrice, orders, products, revenueSeries, trafficSeries } from "@/lib/store-data";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — Voltix inventory & revenue" },
      {
        name: "description",
        content:
          "Track revenue, visitors, WhatsApp enquiries and inventory health for your electronics store in one modern dashboard.",
      },
      { property: "og:title", content: "Seller dashboard — Voltix" },
      {
        property: "og:description",
        content: "Revenue, traffic, enquiries and stock health at a glance.",
      },
    ],
  }),
  component: DashboardHome,
});

const stats = [
  { label: "Revenue (30d)", value: "₦11.2M", delta: 16.4, icon: Wallet, sub: "vs ₦9.6M last month" },
  { label: "Products live", value: "142", delta: 4.2, icon: Box, sub: "6 drafts pending" },
  { label: "Visitors", value: "8,132", delta: 12.1, icon: Eye, sub: "1,620 peak on Saturday" },
  { label: "Orders", value: "167", delta: 9.8, icon: Receipt, sub: "12 awaiting dispatch" },
  { label: "WhatsApp enquiries", value: "453", delta: -3.4, icon: MessageCircle, sub: "avg reply 4m 12s" },
];

function DashboardHome() {
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 4).slice(0, 4);

  return (
    <DashboardShell
      title="Good morning, Ada"
      subtitle="Here's how the Ikeja store is performing today."
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/dashboard/new-product">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="hover-lift rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                <s.icon className="h-4 w-4" />
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  s.delta >= 0 ? "text-accent-foreground" : "text-destructive"
                }`}
              >
                {s.delta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(s.delta)}%
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold tracking-tight">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 truncate text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Revenue"
          subtitle="Millions of ₦, last 7 months"
          badge={
            <Badge className="border-transparent bg-primary-soft text-accent-foreground">
              <TrendingUp className="mr-1 h-3 w-3" /> +16.4%
            </Badge>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueSeries} margin={{ left: -18, right: 6, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Traffic & enquiries" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trafficSeries} margin={{ left: -20, right: 6, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="visitors" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="enquiries" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent activity" subtitle="Live store events" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 py-3.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
                </div>
                <Badge variant="outline" className="hidden shrink-0 rounded-md text-[11px] sm:flex">
                  {a.kind}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Top-selling brands" subtitle="Share of revenue">
          <ul className="space-y-4">
            {brands.map((b) => (
              <li key={b.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground">{b.share}%</span>
                </div>
                <Progress value={b.share * 2.6} className="mt-2 h-1.5" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Inventory status" subtitle="Units needing attention">
          <ul className="space-y-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
                <img
                  src={p.images[0]}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <Badge className="shrink-0 border-transparent bg-warning/20 text-warning-foreground">
                  {p.stock} left
                </Badge>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/dashboard/products">Manage inventory</Link>
          </Button>
        </Panel>

        <Panel title="Latest orders" subtitle="Most recent six">
          <ul className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {o.id} · {o.customer}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{o.item}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}

export function Panel({
  title,
  subtitle,
  badge,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6 ${className ?? ""}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
