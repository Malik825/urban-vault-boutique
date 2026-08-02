import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Search, Tag, Layers, Sparkles } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { brands, categories, formatPrice, popularSearches, products } from "@/lib/store-data";

const recent = ["macbook pro 14", "iphone 15 pro max", "16gb ram laptop"];

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search products, brands and categories…" />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>
          <div className="py-6 text-center">
            <p className="text-sm font-medium">No matches yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a brand like “Dell” or a spec like “16GB”.
            </p>
          </div>
        </CommandEmpty>

        <CommandGroup heading="Recent searches">
          {recent.map((r) => (
            <CommandItem
              key={r}
              value={r}
              onSelect={() => go(() => navigate({ to: "/products", search: { q: r } }))}
            >
              <Clock className="text-muted-foreground" />
              <span>{r}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Products">
          {products.slice(0, 6).map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.name} ${p.brand} ${p.category}`}
              onSelect={() => go(() => navigate({ to: "/product/$slug", params: { slug: p.slug } }))}
            >
              <img
                src={p.images[0]}
                alt=""
                loading="lazy"
                className="h-8 w-8 rounded-md border border-border object-cover"
              />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {formatPrice(p.price)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Brands">
          {brands.map((b) => (
            <CommandItem
              key={b.name}
              value={`brand ${b.name}`}
              onSelect={() => go(() => navigate({ to: "/products", search: { brand: b.name } }))}
            >
              <Tag className="text-muted-foreground" />
              <span className="flex-1">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.products} items</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Categories">
          {categories.map((c) => (
            <CommandItem
              key={c.name}
              value={`category ${c.name}`}
              onSelect={() => go(() => navigate({ to: "/products", search: { category: c.name } }))}
            >
              <Layers className="text-muted-foreground" />
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.count}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Popular right now">
          {popularSearches.map((s) => (
            <CommandItem
              key={s}
              value={`popular ${s}`}
              onSelect={() => go(() => navigate({ to: "/products", search: { q: s } }))}
            >
              <Sparkles className="text-primary" />
              <span>{s}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup>
          <CommandItem
            value="browse all"
            onSelect={() => go(() => navigate({ to: "/products", search: {} }))}
          >
            <Search className="text-muted-foreground" />
            Browse the full catalogue
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
