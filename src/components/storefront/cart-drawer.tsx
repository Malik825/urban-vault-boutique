import { Link } from "@tanstack/react-router";
import { Check, MessageCircle, Minus, Plus, ShoppingCart, Trash2, Truck, X } from "lucide-react";

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
import { optimizeImageUrl } from "@/lib/image";

// Default delivery threshold falls back to 500 if not customized in settings

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
  const settings = useStoreSettings();
  const threshold = parseFloat(settings.freeDeliveryThreshold) || 500;

  const isFreeDelivery = subtotal >= threshold;
  const remainingForFree = Math.max(0, threshold - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / threshold) * 100);

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

        {/* Free Delivery Goal Tracker */}
        {items.length > 0 && (
          <div className="mt-3 rounded-xl border border-border/80 bg-surface-muted/60 p-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              {isFreeDelivery ? (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span><strong>Free Delivery Unlocked!</strong> You qualify for 100% free delivery.</span>
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Add <strong>GH₵ {remainingForFree.toFixed(0)}</strong> more to get <strong>FREE Delivery</strong>!
                  </span>
                </>
              )}
            </div>
            {/* Progress Track */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full transition-all duration-500 ${isFreeDelivery ? "bg-emerald-500" : "bg-primary"
                  }`}
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        )}

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
                      src={optimizeImageUrl(item.product.images[0], 192, 75)}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      loading="lazy"
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
                <span className={isFreeDelivery ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}>
                  {isFreeDelivery ? "FREE (Assin Fosu)" : "From GH₵ 35 (Assin Fosu) · Free Pickup"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-border/60">
                <span>Estimated Total</span>
                <span className="text-primary font-display">
                  {formatPrice(isFreeDelivery ? subtotal : subtotal + 35)}
                </span>
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
                className="w-full border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                size="lg"
              >
                <a
                  href={whatsappLink(createCartWhatsAppMessage(items, subtotal))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
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
