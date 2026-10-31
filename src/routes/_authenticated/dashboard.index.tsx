import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Box,
  Download,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  TrendingUp,
  Users,
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
import { brands, formatPrice, revenueSeries } from "@/lib/store-data";
import { adminGetStats } from "@/lib/admin.functions";


export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — Urban Vault inventory & revenue" },
      {
        name: "description",
        content:
          "Track revenue, orders, WhatsApp enquiries and inventory health for your boutique in one modern dashboard.",
      },
      { property: "og:title", content: "Seller dashboard — Urban Vault" },
      {
        property: "og:description",
        content: "Revenue, traffic, orders and stock health at a glance.",
      },
    ],
  }),
  loader: async () => {
    try {
      return await adminGetStats();
    } catch {
      return null;
    }
  },
  component: DashboardHome,
});

function DashboardHome() {
  const live = Route.useLoaderData();

  const stats = [
    {
      label: "Revenue",
      value: live ? formatPrice((live.totalRevenue ?? 0) / 100) : "—",
      icon: Wallet,
      sub: `${live?.totalOrders ?? 0} orders total`,
    },
    {
      label: "Products live",
      value: live ? String(live.publishedProducts) : "—",
      icon: Box,
      sub: `${live?.draftProducts ?? 0} drafts pending`,
    },
    {
      label: "VIP Members",
      value: live ? String(live.totalCustomers) : "0",
      icon: Users,
      sub: "Registered accounts",
    },
    {
      label: "Orders",
      value: live ? String(live.totalOrders) : "—",
      icon: Receipt,
      sub: `${live?.pendingOrdersCount ?? 0} awaiting dispatch`,
    },
    {
      label: "Concierge Requests",
      value: live ? String(live.totalSourcing) : "0",
      icon: MessageCircle,
      sub: "Custom sourcing requests",
    },
    {
      label: "Low Stock Items",
      value: live ? String(live.lowStockCount) : "0",
      icon: Package,
      sub: "Items needing reorder",
    },
  ];

  const lowStock = (live?.lowStockItems ?? []) as any[];
  const recentOrders = (live?.recentOrders ?? []) as any[];

  return (
    <DashboardShell
      title="Good morning, Admin"
      subtitle="Here's how the Accra store is performing today."
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
      {/* Stats — two-column hero layout */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: large primary card (Revenue + Orders) */}
        {(() => {
          const primary = stats[0]!; // Revenue
          const secondary = stats[3]!; // Orders
          const PrimaryIcon = primary!.icon;
          const SecondaryIcon = secondary!.icon;
          return (
            <div className="hover-lift rounded-lg border border-border bg-card p-6 shadow-card flex flex-col gap-6">
              {/* Primary stat — Revenue */}
              <div className="flex gap-4 items-start">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <PrimaryIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-3xl font-extrabold tracking-tight">{primary!.value}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{primary!.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{primary!.sub}</p>
                </div>
              </div>

              <div className="w-full h-px bg-border/70" />

              {/* Secondary stat — Orders */}
              <div className="flex gap-4 items-start">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <SecondaryIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-3xl font-extrabold tracking-tight">{secondary!.value}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{secondary!.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{secondary!.sub}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Right: 4 stat cards stacked in a 2×2 grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          {[stats[1], stats[2], stats[4], stats[5]].filter(Boolean).map((s: any) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="hover-lift rounded-lg border border-border bg-card px-4 py-3 shadow-card flex items-center gap-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-extrabold tracking-tight">{s.value}</p>
                  <p className="text-xs font-medium text-muted-foreground leading-tight">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Revenue"
          subtitle="Millions of GH₵, last 7 months"
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

        <Panel
          title="Inventory by Category"
          subtitle={live?.categoryDistribution?.length ? "Products per category" : "No category data yet"}
        >
          {live?.categoryDistribution?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={live.categoryDistribution.slice(0, 8)}
                margin={{ left: -20, right: 6, top: 8 }}
                layout="vertical"
              >
                <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  width={90}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v, "Products"]}
                />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Add products to see your catalogue breakdown here.
            </p>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent orders" subtitle="Most recent 6" className="lg:col-span-2">
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o: any) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      #{String(o.id).slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">{o.status}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatPrice((o.total ?? 0) / 100)}</p>
                </li>
              ))}
            </ul>
          )}
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
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No low-stock items 🎉</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p: any) => (
                <li key={p.id} className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  )}
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
          )}
          <Separator className="my-4" />
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/dashboard/products">Manage inventory</Link>
          </Button>
        </Panel>

        <Panel title="Quick actions" subtitle="Common tasks">
          <div className="grid gap-3">
            <Button asChild variant="outline" className="justify-start gap-3 h-auto py-3">
              <Link to="/dashboard/new-product">
                <Plus className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Add new product</p>
                  <p className="text-xs text-muted-foreground">List a new device in the catalogue</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-auto py-3">
              <Link to="/dashboard/orders">
                <Receipt className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold">View all orders</p>
                  <p className="text-xs text-muted-foreground">{live?.pendingOrdersCount ?? 0} pending dispatch</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-auto py-3">
              <Link to="/dashboard/inventory">
                <Box className="h-4 w-4 shrink-0 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Manage inventory</p>
                  <p className="text-xs text-muted-foreground">{lowStock.length} items need restocking</p>
                </div>
              </Link>
            </Button>
          </div>
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
      className={`rounded-xl border border-border bg-card p-3.5 sm:p-6 shadow-card min-w-0 max-w-full overflow-hidden ${className ?? ""}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold truncate">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className="mt-4 sm:mt-5 min-w-0">{children}</div>
    </section>
  );
}


