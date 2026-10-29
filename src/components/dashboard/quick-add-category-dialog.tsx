import { useState, useRef } from "react";
import { FolderPlus, Loader2, Sparkles, UploadCloud } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
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
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileRef = useRef<HTMLInputElement | null>(null);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10 MB limit`);
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Uploading category cover image…");
    try {
      const ext = file.name.split(".").pop() || "webp";
      const path = `categories/new_${Date.now()}.${ext}`;
      const { data: storageData, error: storageErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (storageErr || !storageData) throw new Error(storageErr?.message || "Upload failed");
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      if (urlData?.publicUrl) {
        setImageUrl(urlData.publicUrl);
        setImagePreview(urlData.publicUrl);
        toast.success("Cover image uploaded!", { id: toastId });
      } else {
        toast.error("Could not get public URL.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  }

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
        image: imageUrl || undefined,
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

          {/* Cover Photo Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Cover Photo <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <input
              type="file"
              ref={imageFileRef}
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => imageFileRef.current?.click()}
              disabled={uploadingImage}
              className="relative w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/40 hover:bg-primary/5 overflow-hidden transition-colors flex items-center justify-center group"
            >
              {(imagePreview || imageUrl) ? (
                <img
                  src={imagePreview || imageUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity ${(imagePreview || imageUrl) ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}`}>
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <UploadCloud className={`h-5 w-5 ${(imagePreview || imageUrl) ? "text-white" : "text-muted-foreground"}`} />
                    <span className={`text-[11px] font-medium ${(imagePreview || imageUrl) ? "text-white" : "text-muted-foreground"}`}>
                      {(imagePreview || imageUrl) ? "Change photo" : "Click to upload category photo"}
                    </span>
                  </>
                )}
              </div>
            </button>
            <Input
              placeholder="Or paste image URL…"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImagePreview(null); }}
              className="h-8 text-[11px] font-mono"
            />
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
