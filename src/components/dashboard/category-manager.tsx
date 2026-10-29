import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Pencil,
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
import { generateCategoryBlurb } from "@/lib/ai-copy.functions";

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
  const [suggestingAddBlurb, setSuggestingAddBlurb] = useState(false);

  // Edit category dialog state
  const [editingCategory, setEditingCategory] = useState<CategoryTaxonomy | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState<"All" | "Men" | "Women" | "Unisex">("All");
  const [editBlurb, setEditBlurb] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editSubcatInput, setEditSubcatInput] = useState("");
  const [editSubcats, setEditSubcats] = useState<string[]>([]);
  const [suggestingEditBlurb, setSuggestingEditBlurb] = useState(false);

  // Image upload state for Add dialog
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const newImageFileRef = useRef<HTMLInputElement | null>(null);

  // Image upload state for Edit dialog
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const editImageFileRef = useRef<HTMLInputElement | null>(null);

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
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      saveStoredCategories(next);
      return next;
    });
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
        if (editingCategory && editingCategory.id === catId) {
          setEditImageUrl(urlData.publicUrl);
        }
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

  // Handle image upload for the Add dialog
  async function handleNewCategoryImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10 MB limit`);
      return;
    }
    setUploadingNewImage(true);
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
        setNewImageUrl(urlData.publicUrl);
        setNewImagePreview(urlData.publicUrl);
        toast.success("Cover image uploaded!", { id: toastId });
      } else {
        toast.error("Could not get public URL.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingNewImage(false);
    }
  }

  // Handle image upload for the Edit dialog
  async function handleEditCategoryImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10 MB limit`);
      return;
    }
    setUploadingEditImage(true);
    const toastId = toast.loading("Uploading category cover image…");
    try {
      const ext = file.name.split(".").pop() || "webp";
      const catId = editingCategory?.id || `new_${Date.now()}`;
      const path = `categories/cat_${catId}_${Date.now()}.${ext}`;
      const { data: storageData, error: storageErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (storageErr || !storageData) throw new Error(storageErr?.message || "Upload failed");
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      if (urlData?.publicUrl) {
        setEditImageUrl(urlData.publicUrl);
        toast.success("Cover image uploaded!", { id: toastId });
      } else {
        toast.error("Could not get public URL.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingEditImage(false);
    }
  }

  // AI Suggest for new category
  async function handleAiSuggestNewBlurb() {
    if (!newName.trim()) {
      toast.error("Please enter a category name first");
      return;
    }
    setSuggestingAddBlurb(true);
    try {
      const res = await generateCategoryBlurb({
        data: { name: newName.trim(), department: newDepartment },
      });
      if (res.blurb) {
        setNewBlurb(res.blurb);
        toast.success("AI suggested category blurb!");
      }
    } catch {
      toast.error("Failed to generate blurb");
    } finally {
      setSuggestingAddBlurb(false);
    }
  }

  // AI Suggest for edit category
  async function handleAiSuggestEditBlurb() {
    if (!editName.trim()) {
      toast.error("Please enter a category name first");
      return;
    }
    setSuggestingEditBlurb(true);
    try {
      const res = await generateCategoryBlurb({
        data: { name: editName.trim(), department: editDepartment },
      });
      if (res.blurb) {
        setEditBlurb(res.blurb);
        toast.success("AI suggested category blurb!");
      }
    } catch {
      toast.error("Failed to generate blurb");
    } finally {
      setSuggestingEditBlurb(false);
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

    setNewName("");
    setNewBlurb("");
    setNewDepartment("All");
    setNewSubcats([]);
    setNewImageUrl("");
    setNewImagePreview(null);
    setDialogOpen(false);

    toast.success(`Category "${trimmed}" created! Click 'Save Categories' to broadcast live.`);
  }

  // Open Edit Dialog for a category
  function handleOpenEdit(cat: CategoryTaxonomy) {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDepartment(cat.department || "All");
    setEditBlurb(cat.blurb || "");
    setEditImageUrl(cat.image || "");
    setEditSubcats([...(cat.subcategories || [cat.name])]);
    setEditSubcatInput("");
    setEditDialogOpen(true);
  }

  // Save changes from Edit Dialog
  function handleSaveEdit() {
    if (!editingCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }

    updateCategory(editingCategory.id, {
      name: trimmed,
      department: editDepartment,
      blurb: editBlurb.trim() || `${trimmed} boutique curation`,
      image: editImageUrl.trim() || editingCategory.image,
      subcategories: editSubcats.length > 0 ? editSubcats : [trimmed],
    });

    setEditDialogOpen(false);
    setEditingCategory(null);
    toast.success(`Category "${trimmed}" updated! Click 'Save Categories' to broadcast live.`);
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
            Create new categories on the fly, edit existing categories, auto-generate subtitles with AI, and manage departments without touching code.
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

          {/* Add Category Dialog */}
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-cat-blurb" className="text-xs font-semibold">
                      Editorial Subtitle / Filter Blurb
                    </Label>
                    <button
                      type="button"
                      onClick={handleAiSuggestNewBlurb}
                      disabled={suggestingAddBlurb || !newName.trim()}
                      className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {suggestingAddBlurb ? (
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
                    id="new-cat-blurb"
                    placeholder="Descriptive subtitle displayed under this category in filters and page headers (e.g. Heavyweight boxy tees & luxury button-downs)"
                    value={newBlurb}
                    onChange={(e) => setNewBlurb(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Department</Label>
                  <Select
                    value={newDepartment}
                    onValueChange={(v: "All" | "Men" | "Women" | "Unisex") => setNewDepartment(v)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">
                          {d === "All" ? "All Departments" : `${d}'s Wear`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cover Photo</Label>
                  {/* Hidden file input for new category */}
                  <input
                    type="file"
                    ref={newImageFileRef}
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleNewCategoryImageFile(file);
                      e.target.value = "";
                    }}
                  />
                  {/* Clickable preview / upload zone */}
                  <button
                    type="button"
                    onClick={() => newImageFileRef.current?.click()}
                    disabled={uploadingNewImage}
                    className="relative w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/40 hover:bg-primary/5 overflow-hidden transition-colors flex items-center justify-center group"
                  >
                    {(newImagePreview || newImageUrl) ? (
                      <img
                        src={newImagePreview || newImageUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity ${(newImagePreview || newImageUrl) ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}`}>
                      {uploadingNewImage ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <>
                          <UploadCloud className={`h-6 w-6 ${(newImagePreview || newImageUrl) ? "text-white" : "text-muted-foreground"}`} />
                          <span className={`text-[11px] font-medium ${(newImagePreview || newImageUrl) ? "text-white" : "text-muted-foreground"}`}>
                            {(newImagePreview || newImageUrl) ? "Change photo" : "Click to upload photo"}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                  {/* Fallback URL paste */}
                  <Input
                    placeholder="Or paste image URL…"
                    value={newImageUrl}
                    onChange={(e) => { setNewImageUrl(e.target.value); setNewImagePreview(null); }}
                    className="h-8 text-[11px] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subcategory Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Graphic Tees, Plain Tees"
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
                      variant="outline"
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
                      {newSubcats.map((sc, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[11px] flex items-center gap-1 pl-2 pr-1"
                        >
                          {sc}
                          <button
                            type="button"
                            onClick={() => setNewSubcats(newSubcats.filter((_, idx) => idx !== i))}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
                {/* Header row: image thumbnail + name & department + edit + delete */}
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
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-sm text-foreground truncate">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {!isDefault && (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                            Custom
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit Category details"
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                        </Button>
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
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {cat.department === "All" ? "All Departments" : `${cat.department}'s`}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        ID: {cat.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Filter Editorial Blurb */}
                <div className="space-y-1 min-w-0 bg-surface-muted/40 p-2.5 rounded-xl border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Filter Subtitle / Blurb
                    </Label>
                    <span className="text-[10px] text-primary">Live Storefront Filter</span>
                  </div>
                  <p className="text-xs text-foreground/90 italic line-clamp-2">
                    "{cat.blurb}"
                  </p>
                </div>

                {/* Subcategories tags */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {cat.subcategories.map((sc, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
                      >
                        {sc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Pencil className="h-3 w-3" /> Edit Subtitle &amp; Tags
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadCatId(cat.id);
                    fileInputRef.current?.click();
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <UploadCloud className="h-3 w-3" /> Change Photo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Category
            </DialogTitle>
            <DialogDescription>
              Update category display name, department, editorial filter subtitle, or subcategories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-cat-name" className="text-xs font-semibold">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-cat-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-cat-blurb" className="text-xs font-semibold">
                  Editorial Subtitle / Filter Blurb
                </Label>
                <button
                  type="button"
                  onClick={handleAiSuggestEditBlurb}
                  disabled={suggestingEditBlurb || !editName.trim()}
                  className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {suggestingEditBlurb ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Suggesting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" /> ✨ AI Auto-Suggest
                    </>
                  )}
                </button>
              </div>
              <Textarea
                id="edit-cat-blurb"
                rows={2}
                value={editBlurb}
                onChange={(e) => setEditBlurb(e.target.value)}
                placeholder="Descriptive subtitle displayed under this category in filters..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department</Label>
              <Select
                value={editDepartment}
                onValueChange={(v: "All" | "Men" | "Women" | "Unisex") => setEditDepartment(v)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d === "All" ? "All Departments" : `${d}'s Wear`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cover Photo</Label>
              {/* Hidden file input for edit */}
              <input
                type="file"
                ref={editImageFileRef}
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEditCategoryImageFile(file);
                  e.target.value = "";
                }}
              />
              {/* Clickable preview / upload zone */}
              <button
                type="button"
                onClick={() => editImageFileRef.current?.click()}
                disabled={uploadingEditImage}
                className="relative w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/40 hover:bg-primary/5 overflow-hidden transition-colors flex items-center justify-center group"
              >
                {editImageUrl ? (
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                ) : null}
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity ${editImageUrl ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}`}>
                  {uploadingEditImage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <>
                      <UploadCloud className={`h-6 w-6 ${editImageUrl ? "text-white" : "text-muted-foreground"}`} />
                      <span className={`text-[11px] font-medium ${editImageUrl ? "text-white" : "text-muted-foreground"}`}>
                        {editImageUrl ? "Change photo" : "Click to upload photo"}
                      </span>
                    </>
                  )}
                </div>
              </button>
              {/* Fallback URL paste */}
              <Input
                placeholder="Or paste image URL…"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="h-8 text-[11px] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subcategory Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Vintage, Boxy, Oversized"
                  value={editSubcatInput}
                  onChange={(e) => setEditSubcatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = editSubcatInput.trim();
                      if (val && !editSubcats.includes(val)) {
                        setEditSubcats([...editSubcats, val]);
                        setEditSubcatInput("");
                      }
                    }
                  }}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    const val = editSubcatInput.trim();
                    if (val && !editSubcats.includes(val)) {
                      setEditSubcats([...editSubcats, val]);
                      setEditSubcatInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {editSubcats.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editSubcats.map((sc, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[11px] flex items-center gap-1 pl-2 pr-1"
                    >
                      {sc}
                      <button
                        type="button"
                        onClick={() => setEditSubcats(editSubcats.filter((_, idx) => idx !== i))}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="hero"
              onClick={handleSaveEdit}
              className="font-bold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
