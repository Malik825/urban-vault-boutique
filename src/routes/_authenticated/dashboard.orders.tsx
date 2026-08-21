import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Truck, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatPrice } from "@/lib/store-data";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";

type Order = Awaited<ReturnType<typeof adminListOrders>>[number];

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

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
  loader: async () => {
    try {
      return await adminListOrders();
    } catch {
      return [];
    }
  },
  component: Orders,
});

function statusColor(status: string) {
  if (status === "delivered") return "border-transparent bg-primary-soft text-accent-foreground";
  if (status === "cancelled") return "border-transparent bg-destructive/10 text-destructive";
  if (status === "shipped") return "border-transparent bg-blue-500/10 text-blue-600";
  return "";
}

function Orders() {
  const orders = Route.useLoaderData() as Order[];
  const pending = orders.filter((o) => o.status === "pending" || o.status === "processing");

  async function updateStatus(id: string, status: string) {
    try {
      await adminUpdateOrderStatus({ data: { id, status } });
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  }

  return (
    <DashboardShell
      title="Orders"
      subtitle={`${orders.length} orders total · ${pending.length} awaiting dispatch`}
      actions={
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card">
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-display text-base font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Orders placed on the storefront will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const addr = o.shipping_address as Record<string, string> | null;
                return (
                  <TableRow key={o.id} className="transition-colors hover:bg-surface-muted">
                    <TableCell className="font-semibold text-xs">
                      #{String(o.id).slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor(o.status ?? "")}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-GH")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {addr ? `${addr.city ?? ""}, ${addr.region ?? ""}`.replace(/^, |, $/, "") : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice((o.total ?? 0) / 100)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Change status">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ORDER_STATUSES.map((s) => (
                            <DropdownMenuItem key={s} onClick={() => void updateStatus(o.id, s)} className="capitalize">
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
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
