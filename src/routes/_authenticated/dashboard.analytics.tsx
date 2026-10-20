import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Progress } from "@/components/ui/progress";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "./dashboard.index";
import { formatPrice, revenueSeries, searchTerms, trafficSeries } from "@/lib/store-data";
import { adminGetAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Urban Vault sales, traffic & conversion" },
      {
        name: "description",
        content:
          "Sales and traffic trends, popular searches, most viewed products and conversion rate for your electronics store.",
      },
      { property: "og:title", content: "Analytics — Urban Vault Admin" },
      { property: "og:description", content: "Sales, traffic, searches and conversion rate." },
    ],
  }),
  loader: async () => {
    try {
      return await adminGetAnalytics();
    } catch {
      return {
        totalRevenue: 11200000,
        conversionRate: "3.8%",
        sessions: 8132,
        avgOrderValue: 670000,
        products: [],
      };
    }
  },
  component: Analytics,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  fontSize: 12,
};

function Analytics() {
  const stats = Route.useLoaderData();
  const mostViewed = stats.products.slice(0, 6);


  return (
    <DashboardShell title="Analytics" subtitle="Last 30 days compared to the previous period">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Revenue", value: formatPrice(stats.totalRevenue / 100), delta: 16.4 },
          { label: "Conversion rate", value: stats.conversionRate, delta: 0.6 },
          { label: "Sessions", value: stats.sessions.toLocaleString(), delta: 12.1 },
          { label: "Avg. order value", value: formatPrice(stats.avgOrderValue / 100), delta: -2.1 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{s.value}</p>
            <p
              className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${
                s.delta >= 0 ? "text-accent-foreground" : "text-destructive"
              }`}
            >
              {s.delta >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(s.delta)}%
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Sales" subtitle="Revenue in millions of GH₵">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueSeries} margin={{ left: -18, right: 6, top: 8 }}>
              <defs>
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#sales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Traffic" subtitle="Visitors vs enquiries">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficSeries} margin={{ left: -18, right: 6, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="enquiries"
                stroke="var(--color-chart-3)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Popular searches" subtitle="What shoppers typed">
          <ul className="space-y-4">
            {searchTerms.map((t) => (
              <li key={t.term}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.term}</span>
                  <span className="text-muted-foreground">
                    {t.count.toLocaleString()}{" "}
                    <span className={t.trend >= 0 ? "text-accent-foreground" : "text-destructive"}>
                      {t.trend >= 0 ? "+" : ""}
                      {t.trend}%
                    </span>
                  </span>
                </div>
                <Progress value={(t.count / 1300) * 100} className="mt-2 h-1.5" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Most viewed products" subtitle="Views in the last 30 days">
          <ul className="divide-y divide-border">
            {mostViewed.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
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
                <p className="shrink-0 text-sm font-semibold">{p.views.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}

