import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES_TAXONOMY,
  DEPARTMENTS,
  type CategoryTaxonomy,
} from "@/lib/store-data";
import {
  adminGetCategories,
  adminSaveCategories,
} from "@/lib/categories.functions";
import {
  loadStoredCategories,
  saveStoredCategories,
  slugifyCategory,
} from "@/lib/categories";

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // New category dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDepartment, setNewDepartment] = useState<"All" | "Men" | "Women" | "Unisex">("All");
  const [newBlurb, setNewBlurb] = useState("");
  const [newSubcatInput, setNewSubcatInput] = useState("");
  const [newSubcats, setNewSubcats] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadCatId, setActiveUploadCatId] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    adminGetCategories()
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            saveStoredCategories(data);
          } else {
            const fallback = loadStoredCategories();
            setCategories(fallback);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        if (isMounted) {
          setCategories(loadStoredCategories());
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update a category field
  function updateCategory(id: string, patch: Partial<CategoryTaxonomy>) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  // Handle uploading an image for a category
  async function handleImageFile(catId: string, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10 MB limit`);
      return;
    }

    setUploadingId(catId);
    const toastId = toast.loading(`Uploading cover image for category…`);

    try {
      const ext = file.name.split(".").pop() || "webp";
      const path = `categories/cat_${catId}_${Date.now()}.${ext}`;

      const { data: storageData, error: storageErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (storageErr || !storageData) {
        throw new Error(storageErr?.message || "Storage upload failed");
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      if (urlData?.publicUrl) {
        updateCategory(catId, { image: urlData.publicUrl });
        toast.success("Category image updated successfully!", { id: toastId });
      } else {
        toast.error("Upload succeeded but could not get public URL.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingId(null);
      setActiveUploadCatId(null);
    }
  }

  // Add category handler
  function handleAddCategory() {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    const id = slugifyCategory(trimmed);
    if (categories.some((c) => c.id === id || c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists.`);
      return;
    }

    const newCategory: CategoryTaxonomy = {
      id,
      name: trimmed,
      department: newDepartment,
      image:
        newImageUrl.trim() ||
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      blurb: newBlurb.trim() || `${trimmed} boutique collection & curated styles`,
      count: 0,
      subcategories: newSubcats.length > 0 ? newSubcats : [trimmed],
    };

    const nextList = [newCategory, ...categories];
    setCategories(nextList);
    saveStoredCategories(nextList);

    // Reset dialog
    setNewName("");
    setNewBlurb("");
    setNewDepartment("All");
    setNewSubcats([]);
    setNewImageUrl("");
    setDialogOpen(false);

    toast.success(`Category "${trimmed}" added! Click 'Save Categories' to publish live.`);
  }

  // Delete category handler
  function handleDeleteCategory(id: string, name: string) {
    if (categories.length <= 1) {
      toast.error("You must have at least one category.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove the "${name}" category?`)) {
      return;
    }

    const nextList = categories.filter((c) => c.id !== id);
    setCategories(nextList);
    saveStoredCategories(nextList);
    toast.info(`Removed "${name}". Click 'Save Categories' to persist.`);
  }

  // Reset to default categories
  function handleReset() {
    if (
      window.confirm(
        "Reset categories to default boutique catalog? Custom categories will be removed.",
      )
    ) {
      setCategories(CATEGORIES_TAXONOMY);
      saveStoredCategories(CATEGORIES_TAXONOMY);
      toast.info("Categories reset to default. Click 'Save Categories' to broadcast live.");
    }
  }

  // Save changes to Supabase storage + localStorage
  async function handleSave() {
    setSaving(true);
    const toastId = toast.loading("Broadcasting categories live to storefront & admin…");

    try {
      saveStoredCategories(categories);
      const res = await adminSaveCategories({ data: { categories } });
      if (res.ok) {
        toast.success(`Published ${categories.length} categories successfully!`, {
          id: toastId,
        });
      } else {
        toast.error("Failed to save categories to server.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to persist categories.", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.blurb.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.subcategories.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading categories taxonomy…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadCatId) {
            handleImageFile(activeUploadCatId, file);
          }
          e.target.value = "";
        }}
      />

      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-primary/20 bg-primary/5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground truncate">
              Dynamic Categories &amp; Filter Subtitles ({categories.length} Total)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create new categories on the fly, edit filter subtitles / editorial blurbs, and manage departments without touching code.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 flex-1 sm:flex-none justify-center"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 shrink-0" /> Reset Defaults
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 flex-1 sm:flex-none justify-center border-primary/40 text-primary hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5 mr-1 shrink-0" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" /> Add New Category
                </DialogTitle>
                <DialogDescription>
                  This category will immediately become available in the product filter sidebar, new product form, and homepage showcase.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new-cat-name" className="text-xs font-semibold">
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="new-cat-name"
                    placeholder="e.g. Vintage Jackets, Cuban Sets, Caps"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-cat-blurb" className="text-xs font-semibold">
                    Editorial Subtitle / Filter Blurb
                  </Label>
                  <Textarea
                    id="new-cat-blurb"
                    placeholder="Descriptive subtitle displayed under this category in filters and page headers (e.g. Heavyweight boxy tees & luxury button-downs)"
                    value={newBlurb}
                    onChange={(e) => setNewBlurb(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Department</Label>
                  <Select
                    value={newDepartment}
                    onValueChange={(v: "All" | "Men" | "Women" | "Unisex") =>
                      setNewDepartment(v)
                    }
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Subcategories / Tags (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a subcategory and hit Add"
                      value={newSubcatInput}
                      onChange={(e) => setNewSubcatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newSubcatInput.trim();
                          if (val && !newSubcats.includes(val)) {
                            setNewSubcats([...newSubcats, val]);
                            setNewSubcatInput("");
                          }
                        }
                      }}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => {
                        const val = newSubcatInput.trim();
                        if (val && !newSubcats.includes(val)) {
                          setNewSubcats([...newSubcats, val]);
                          setNewSubcatInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {newSubcats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newSubcats.map((sc) => (
                        <Badge
                          key={sc}
                          variant="secondary"
                          className="text-[11px] py-0 px-2 gap-1 items-center"
                        >
                          {sc}
                          <button
                            type="button"
                            onClick={() =>
                              setNewSubcats(newSubcats.filter((x) => x !== sc))
                            }
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-cat-img" className="text-xs font-semibold">
                    Cover Image URL (Optional)
                  </Label>
                  <Input
                    id="new-cat-img"
                    placeholder="https://... or upload later"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="hero"
                  onClick={handleAddCategory}
                  className="font-bold"
                >
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="hero"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs h-8 font-bold shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1 shrink-0" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1 shrink-0" /> Save Categories
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Filter categories by name, subtitle or department…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {filteredCategories.map((cat) => {
          const isDefault = CATEGORIES_TAXONOMY.some((d) => d.id === cat.id);
          const isUploading = uploadingId === cat.id;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3.5 min-w-0 flex flex-col justify-between transition-all hover:border-primary/40"
            >
              <div className="space-y-3 min-w-0">
                {/* Header row: image thumbnail + name & department + delete */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Thumbnail / Upload trigger */}
                  <div className="relative group shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-surface-muted border border-border">
                    <img
                      src={cat.image || "/urban-vault-logo.jpg"}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setActiveUploadCatId(cat.id);
                        fileInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold"
                      title="Upload cover image"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 mb-0.5" />
                          <span>Upload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Name and Department */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                        className="h-8 font-bold text-sm px-2 py-0 border-transparent hover:border-border focus:border-primary transition-colors"
                        placeholder="Category Name"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {!isDefault ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                            Custom
                          </Badge>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={cat.department}
                        onValueChange={(v: "All" | "Men" | "Women" | "Unisex") =>
                          updateCategory(cat.id, { department: v })
                        }
                      >
                        <SelectTrigger className="h-6 text-[11px] w-28 px-2 py-0">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d} className="text-xs">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        ID: {cat.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Filter Editorial Blurb */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Filter Subtitle / Description
                    </Label>
                    <span className="text-[10px] text-primary font-medium">
                      Shown under filter option &amp; category page
                    </span>
                  </div>
                  <Textarea
                    value={cat.blurb}
                    onChange={(e) => updateCategory(cat.id, { blurb: e.target.value })}
                    rows={2}
                    placeholder="Enter editorial blurb / subtitle (e.g. Luxury heavyweight tees & Cuban shirts)..."
                    className="text-xs min-h-[48px] resize-none"
                  />
                </div>

                {/* Subcategories tags */}
                <div className="space-y-1 min-w-0">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Subcategories
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {cat.subcategories.map((sub, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[10px] py-0 px-1.5 gap-1 font-normal"
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cat.subcategories.filter((_, i) => i !== idx);
                            updateCategory(cat.id, { subcategories: updated });
                          }}
                          className="hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const promptVal = window.prompt(`Add a subcategory tag for "${cat.name}":`);
                        if (promptVal && promptVal.trim()) {
                          const val = promptVal.trim();
                          if (!cat.subcategories.includes(val)) {
                            updateCategory(cat.id, {
                              subcategories: [...cat.subcategories, val],
                            });
                          }
                        }
                      }}
                      className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" /> Add tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct image URL input for fast changes */}
              <div className="pt-2 border-t border-border/50 flex items-center gap-2 min-w-0">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={cat.image}
                  onChange={(e) => updateCategory(cat.id, { image: e.target.value })}
                  placeholder="Image URL"
                  className="h-6 text-[10px] font-mono px-2 py-0 flex-1 min-w-0"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 min-w-0">
        <p className="text-xs text-muted-foreground">
          Tip: Hit <span className="font-semibold text-foreground">Save Categories</span> to broadcast changes live across all storefront filters and admin forms.
        </p>
        <Button
          type="button"
          variant="hero"
          onClick={handleSave}
          disabled={saving}
          className="font-bold text-xs h-9 px-5 w-full sm:w-auto shrink-0 justify-center"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save Categories
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
