import { useState } from "react";
import { FolderPlus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEPARTMENTS } from "@/lib/store-data";
import { useDynamicCategories } from "@/lib/categories";
import { generateCategoryBlurb } from "@/lib/ai-copy.functions";

interface QuickAddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (categoryName: string) => void;
}

export function QuickAddCategoryDialog({
  open,
  onOpenChange,
  onCategoryCreated,
}: QuickAddCategoryDialogProps) {
  const { addCategoryOnTheFly } = useDynamicCategories();
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [department, setDepartment] = useState<"All" | "Men" | "Women" | "Unisex">("All");
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  async function handleAiSuggest() {
    if (!name.trim()) {
      toast.error("Please enter a category name first");
      return;
    }
    setSuggesting(true);
    try {
      const res = await generateCategoryBlurb({
        data: { name: name.trim(), department },
      });
      if (res.blurb) {
        setBlurb(res.blurb);
        toast.success("AI suggested subtitle blurb!");
      }
    } catch {
      toast.error("Failed to generate blurb");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    setSubmitting(true);
    try {
      const created = await addCategoryOnTheFly({
        name: trimmed,
        blurb: blurb.trim() || `${trimmed} boutique collection`,
        department,
      });

      if (created) {
        toast.success(`Category "${created.name}" created!`);
        onCategoryCreated(created.name);
        setName("");
        setBlurb("");
        setDepartment("All");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" /> Add Category On The Fly
          </DialogTitle>
          <DialogDescription>
            Create a new category instantly. It will be immediately selected for this product and added to storefront category filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="quick-cat-name" className="text-xs font-semibold">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-cat-name"
              placeholder="e.g. Round Neck Tops, Two Pieces, Short Dresses"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="quick-cat-blurb" className="text-xs font-semibold">
                Editorial Subtitle / Filter Blurb
              </Label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={suggesting || !name.trim()}
                className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {suggesting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Suggesting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" /> ✨ AI Suggest
                  </>
                )}
              </button>
            </div>
            <Textarea
              id="quick-cat-blurb"
              placeholder="Descriptive blurb shown under category filter and page headers (e.g. Heavyweight boxy tees & luxury streetwear)"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              className="text-xs min-h-[64px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Department</Label>
            <Select
              value={department}
              onValueChange={(v: "All" | "Men" | "Women" | "Unisex") => setDepartment(v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "All" ? "All Departments" : `${d}'s Wear`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="hero"
            onClick={handleCreate}
            disabled={submitting}
            className="font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
