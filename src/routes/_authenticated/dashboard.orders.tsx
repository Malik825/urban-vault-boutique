import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatPrice, orders } from "@/lib/store-data";

export const Route = createFileRoute("/_authenticated/dashboard/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Voltix seller dashboard" },
      {
        name: "description",
        content: "Track order status, invoices, payments and shipping for every customer purchase.",
      },
      { property: "og:title", content: "Orders — Voltix seller dashboard" },
      { property: "og:description", content: "Status timeline, invoices, payments and shipping." },
    ],
  }),
  component: Orders,
});

const timeline = ["Placed", "Paid", "Processing", "Shipped", "Delivered"];

function Orders() {
  return (
    <DashboardShell
      title="Orders"
      subtitle="167 orders this month · 12 awaiting dispatch"
      actions={
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <h2 className="font-display text-base font-bold">Order #4821 · Amaka Obi</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-5">
          {timeline.map((t, i) => (
            <li key={t} className="relative">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  i <= 3 ? "bg-primary text-primary-foreground" : "border border-border bg-surface"
                }`}
              >
                {i + 1}
              </span>
              <p className="mt-2 text-sm font-semibold">{t}</p>
              <p className="text-xs text-muted-foreground">{i <= 3 ? "Aug 1, 2026" : "Pending"}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <Info icon={FileText} label="Invoice" value="INV-4821 · paid in full" />
          <Info icon={Truck} label="Shipping" value="GIG Logistics · VI, Lagos" />
          <Info icon={FileText} label="Payment" value="Bank transfer · GH₵2,450,000" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} className="transition-colors hover:bg-surface-muted">
                <TableCell className="font-semibold">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground">
                  {o.item}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      o.status === "Delivered" || o.status === "Paid"
                        ? "border-transparent bg-primary-soft text-accent-foreground"
                        : o.status === "Cancelled"
                          ? "border-transparent bg-destructive/10 text-destructive"
                          : ""
                    }
                  >
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
                <TableCell className="text-right font-semibold">{formatPrice(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
