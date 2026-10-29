const fs = require('fs');

// ─── category-manager.tsx ─────────────────────────────────────────────────────
const cmPath = 'src/components/dashboard/category-manager.tsx';
let cm = fs.readFileSync(cmPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add new state + refs after the existing suggestingEditBlurb state line
cm = cm.replace(
  `  const [suggestingEditBlurb, setSuggestingEditBlurb] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);`,
  `  const [suggestingEditBlurb, setSuggestingEditBlurb] = useState(false);

  // Image upload state for Add dialog
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const newImageFileRef = useRef<HTMLInputElement | null>(null);

  // Image upload state for Edit dialog
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const editImageFileRef = useRef<HTMLInputElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);`
);

// 2. Add handleNewCategoryImageFile + handleEditCategoryImageFile after handleImageFile function
cm = cm.replace(
  `  // AI Suggest for new category`,
  `  // Handle image upload for the Add dialog
  async function handleNewCategoryImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(\`\${file.name} exceeds 10 MB limit\`);
      return;
    }
    setUploadingNewImage(true);
    const toastId = toast.loading("Uploading category cover image…");
    try {
      const ext = file.name.split(".").pop() || "webp";
      const path = \`categories/new_\${Date.now()}.\${ext}\`;
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
      toast.error(\`\${file.name} exceeds 10 MB limit\`);
      return;
    }
    setUploadingEditImage(true);
    const toastId = toast.loading("Uploading category cover image…");
    try {
      const ext = file.name.split(".").pop() || "webp";
      const catId = editingCategory?.id || \`new_\${Date.now()}\`;
      const path = \`categories/cat_\${catId}_\${Date.now()}.\${ext}\`;
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

  // AI Suggest for new category`
);

// 3. Reset newImagePreview on add dialog close
cm = cm.replace(
  `    setNewSubcats([]);
    setNewImageUrl("");
    setDialogOpen(false);`,
  `    setNewSubcats([]);
    setNewImageUrl("");
    setNewImagePreview(null);
    setDialogOpen(false);`
);

// 4. Replace "Cover Photo URL" input in Add dialog with upload widget
cm = cm.replace(
  `                <div className="space-y-1.5">
                  <Label htmlFor="new-cat-img" className="text-xs font-semibold">
                    Cover Photo URL (Optional)
                  </Label>
                  <Input
                    id="new-cat-img"
                    placeholder="https://... or /boutique/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>`,
  `                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cover Photo</Label>
                  {/* Hidden file input */}
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
                  {/* Clickable preview / drop zone */}
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
                    <div className={\`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity \${(newImagePreview || newImageUrl) ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}\`}>
                      {uploadingNewImage ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <>
                          <UploadCloud className={\`h-6 w-6 \${(newImagePreview || newImageUrl) ? "text-white" : "text-muted-foreground"}\`} />
                          <span className={\`text-[11px] font-medium \${(newImagePreview || newImageUrl) ? "text-white" : "text-muted-foreground"}\`}>
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
                </div>`
);

// 5. Replace "Cover Photo URL" input in Edit dialog with upload widget
cm = cm.replace(
  `            <div className="space-y-1.5">
              <Label htmlFor="edit-cat-img" className="text-xs font-semibold">
                Cover Photo URL
              </Label>
              <Input
                id="edit-cat-img"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>`,
  `            <div className="space-y-1.5">
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
              {/* Clickable preview / drop zone */}
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
                <div className={\`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity \${editImageUrl ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}\`}>
                  {uploadingEditImage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <>
                      <UploadCloud className={\`h-6 w-6 \${editImageUrl ? "text-white" : "text-muted-foreground"}\`} />
                      <span className={\`text-[11px] font-medium \${editImageUrl ? "text-white" : "text-muted-foreground"}\`}>
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
            </div>`
);

fs.writeFileSync(cmPath, cm, 'utf8');
console.log('✅ category-manager.tsx updated');

// ─── quick-add-category-dialog.tsx ───────────────────────────────────────────
const qdPath = 'src/components/dashboard/quick-add-category-dialog.tsx';
let qd = fs.readFileSync(qdPath, 'utf8').replace(/\r\n/g, '\n');

// Add UploadCloud, useRef imports
qd = qd.replace(
  `import { useState } from "react";
import { FolderPlus, Loader2, Sparkles } from "lucide-react";`,
  `import { useState, useRef } from "react";
import { FolderPlus, Loader2, Sparkles, UploadCloud } from "lucide-react";`
);

// Add supabase import
qd = qd.replace(
  `import { DEPARTMENTS } from "@/lib/store-data";`,
  `import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/store-data";`
);

// Add imageUrl, imagePreview, uploading, imageFileRef state after existing states
qd = qd.replace(
  `  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);`,
  `  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileRef = useRef<HTMLInputElement | null>(null);`
);

// Add handleImageUpload function before handleAiSuggest
qd = qd.replace(
  `  async function handleAiSuggest() {`,
  `  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(\`\${file.name} exceeds 10 MB limit\`);
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Uploading category cover image…");
    try {
      const ext = file.name.split(".").pop() || "webp";
      const path = \`categories/new_\${Date.now()}.\${ext}\`;
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

  async function handleAiSuggest() {`
);

// Pass imageUrl to addCategoryOnTheFly
qd = qd.replace(
  `      const created = await addCategoryOnTheFly({
        name: trimmed,
        blurb: blurb.trim() || \`\${trimmed} boutique collection\`,
        department,
      });`,
  `      const created = await addCategoryOnTheFly({
        name: trimmed,
        blurb: blurb.trim() || \`\${trimmed} boutique collection\`,
        department,
        image: imageUrl || undefined,
      });`
);

// Reset imageUrl and imagePreview on success
qd = qd.replace(
  `        setName("");
        setBlurb("");
        setDepartment("All");
        onOpenChange(false);`,
  `        setName("");
        setBlurb("");
        setDepartment("All");
        setImageUrl("");
        setImagePreview(null);
        onOpenChange(false);`
);

// Add image upload widget before the DialogFooter inside the dialog body (after department select)
qd = qd.replace(
  `        </div>

        <DialogFooter className="gap-2 sm:gap-0">`,
  `          <div className="space-y-1.5">
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
              <div className={\`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity \${(imagePreview || imageUrl) ? "opacity-0 group-hover:opacity-100 bg-black/50" : "opacity-100"}\`}>
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <UploadCloud className={\`h-5 w-5 \${(imagePreview || imageUrl) ? "text-white" : "text-muted-foreground"}\`} />
                    <span className={\`text-[11px] font-medium \${(imagePreview || imageUrl) ? "text-white" : "text-muted-foreground"}\`}>
                      {(imagePreview || imageUrl) ? "Change photo" : "Click to upload photo"}
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">`
);

fs.writeFileSync(qdPath, qd, 'utf8');
console.log('✅ quick-add-category-dialog.tsx updated');
