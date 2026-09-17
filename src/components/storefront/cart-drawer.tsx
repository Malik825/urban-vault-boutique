import { Link } from "@tanstack/react-router";
import { MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { createCartWhatsAppMessage, formatPrice, whatsappLink } from "@/lib/store-data";

export function CartDrawer({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const { items, removeItem, updateQty, count, subtotal } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart {count > 0 && `(${count})`}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Looks like you haven't added anything yet.
                </p>
              </div>
              <SheetTrigger asChild>
                <Button variant="outline" className="mt-4">
                  Continue shopping
                </Button>
              </SheetTrigger>
            </div>
          ) : (
            <ul className="-my-6 divide-y divide-border">
              {items.map((item) => (
                <li key={item.product.id} className="flex py-6">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <h3 className="line-clamp-1">
                          <Link
                            to="/product/$slug"
                            params={{ slug: item.product.slug }}
                            onClick={() => onOpenChange?.(false)}
                            className="hover:underline"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="ml-4 whitespace-nowrap">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.product.condition}
                      </p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => updateQty(item.product.id, item.qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-4 text-center text-xs font-medium">
                          {item.qty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6"
                          disabled={item.qty >= item.product.stock}
                          onClick={() => updateQty(item.product.id, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-1 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Estimated Delivery</span>
                <span>From GH₵ 40 (Accra) · Free Pickup</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-border/60">
                <span>Estimated Total</span>
                <span className="text-primary font-display">{formatPrice(subtotal + 40)}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Choose instant web checkout or order directly via WhatsApp.
            </p>

            <div className="space-y-2 pt-1">
              <SheetTrigger asChild>
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetTrigger>

              <Button
                asChild
                variant="outline"
                className="w-full border-emerald-500/50 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 font-semibold"
                size="lg"
              >
                <a
                  href={whatsappLink(createCartWhatsAppMessage(items, subtotal))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Send Cart to WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
