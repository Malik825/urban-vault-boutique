const fs = require('fs');

function updateNewProduct() {
  let file = fs.readFileSync('src/routes/_authenticated/dashboard.new-product.tsx', 'utf8').replace(/\r\n/g, '\n');

  // 1. Imports
  file = file.replace(
    'import { Check, ImagePlus, ArrowLeft, ArrowRight, Plus, Star, UploadCloud, Loader2 } from "lucide-react";',
    'import { Check, ImagePlus, ArrowLeft, ArrowRight, Plus, Star, UploadCloud, Loader2, Sparkles } from "lucide-react";'
  );

  file = file.replace(
    'SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,',
    'SelectContent,\n  SelectGroup,\n  SelectItem,\n  SelectLabel,\n  SelectTrigger,\n  SelectValue,'
  );

  file = file.replace(
    'import { useDynamicCategories } from "@/lib/categories";',
    'import { useDynamicCategories, groupCategoriesForSelect } from "@/lib/categories";\nimport { generateProductDescription } from "@/lib/ai-copy.functions";'
  );

  // 2. Add state & handler
  const stateInsertTarget = 'const [quickCatOpen, setQuickCatOpen] = useState(false);';
  const stateReplacement = `const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [generatingAiDesc, setGeneratingAiDesc] = useState(false);

  async function handleGenerateAiDescription() {
    if (!formData.name.trim()) {
      toast.error("Please enter a product title first");
      return;
    }
    setGeneratingAiDesc(true);
    try {
      const res = await generateProductDescription({
        data: {
          title: formData.name.trim(),
          category: formData.category,
          department: formData.department,
        },
      });
      if (res.description) {
        updateField("blurb", res.description);
        toast.success("AI suggested product description!");
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setGeneratingAiDesc(false);
    }
  }`;

  if (file.includes(stateInsertTarget)) {
    file = file.replace(stateInsertTarget, stateReplacement);
  }

  // 3. Category Select with grouping
  const oldCategorySelect = `                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      if (v === "__ADD_NEW__") {
                        setQuickCatOpen(true);
                      } else {
                        updateField("category", v);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__ADD_NEW__" className="text-primary font-bold">
                        + Add new category on the fly…
                      </SelectItem>
                      {dynamicCategories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>`;

  const newCategorySelect = `                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      if (v === "__ADD_NEW__") {
                        setQuickCatOpen(true);
                      } else {
                        updateField("category", v);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="__ADD_NEW__" className="text-primary font-bold border-b border-border/50 pb-2 mb-1">
                        + Add new category on the fly…
                      </SelectItem>
                      {groupCategoriesForSelect(dynamicCategories).map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground px-2 pt-2 pb-0.5">
                            {group.label}
                          </SelectLabel>
                          {group.items.map((c) => (
                            <SelectItem key={c.name} value={c.name} className="text-sm">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>`;

  if (file.includes(oldCategorySelect)) {
    file = file.replace(oldCategorySelect, newCategorySelect);
  } else {
    console.warn("oldCategorySelect not matched in dashboard.new-product.tsx");
  }

  // 4. Description AI button
  const oldDesc = `                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Product Description & Styling Notes</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="Describe the fabric weight, silhouette, occasion, drape, and styling recommendations for the boutique client..."
                    className="rounded-xl"
                  />
                </div>`;

  const newDesc = `                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desc">Product Description & Styling Notes</Label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={generatingAiDesc || !formData.name.trim()}
                      className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {generatingAiDesc ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating description…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>✨ AI Auto-Suggest Description</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="Describe the fabric weight, silhouette, occasion, drape, and styling recommendations for the boutique client..."
                    className="rounded-xl"
                  />
                </div>`;

  if (file.includes(oldDesc)) {
    file = file.replace(oldDesc, newDesc);
  } else {
    console.warn("oldDesc not matched in dashboard.new-product.tsx");
  }

  fs.writeFileSync('src/routes/_authenticated/dashboard.new-product.tsx', file, 'utf8');
  console.log('dashboard.new-product.tsx updated');
}

function updateEditProduct() {
  let file = fs.readFileSync('src/routes/_authenticated/dashboard.product.$id.edit.tsx', 'utf8').replace(/\r\n/g, '\n');

  file = file.replace(
    'import { Check, ImagePlus, ArrowLeft, ArrowRight, Plus, Star, UploadCloud, Loader2 } from "lucide-react";',
    'import { Check, ImagePlus, ArrowLeft, ArrowRight, Plus, Star, UploadCloud, Loader2, Sparkles } from "lucide-react";'
  );

  file = file.replace(
    'SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,',
    'SelectContent,\n  SelectGroup,\n  SelectItem,\n  SelectLabel,\n  SelectTrigger,\n  SelectValue,'
  );

  file = file.replace(
    'import { useDynamicCategories } from "@/lib/categories";',
    'import { useDynamicCategories, groupCategoriesForSelect } from "@/lib/categories";\nimport { generateProductDescription } from "@/lib/ai-copy.functions";'
  );

  const stateInsertTarget = 'const [quickCatOpen, setQuickCatOpen] = useState(false);';
  const stateReplacement = `const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [generatingAiDesc, setGeneratingAiDesc] = useState(false);

  async function handleGenerateAiDescription() {
    if (!formData.name.trim()) {
      toast.error("Please enter a product title first");
      return;
    }
    setGeneratingAiDesc(true);
    try {
      const res = await generateProductDescription({
        data: {
          title: formData.name.trim(),
          category: formData.category,
          department: formData.department,
        },
      });
      if (res.description) {
        updateField("blurb", res.description);
        toast.success("AI suggested product description!");
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setGeneratingAiDesc(false);
    }
  }`;

  if (file.includes(stateInsertTarget)) {
    file = file.replace(stateInsertTarget, stateReplacement);
  }

  const oldCategorySelect = `                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      if (v === "__ADD_NEW__") {
                        setQuickCatOpen(true);
                      } else {
                        updateField("category", v);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__ADD_NEW__" className="text-primary font-bold">
                        + Add new category on the fly…
                      </SelectItem>
                      {dynamicCategories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>`;

  const newCategorySelect = `                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      if (v === "__ADD_NEW__") {
                        setQuickCatOpen(true);
                      } else {
                        updateField("category", v);
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="__ADD_NEW__" className="text-primary font-bold border-b border-border/50 pb-2 mb-1">
                        + Add new category on the fly…
                      </SelectItem>
                      {groupCategoriesForSelect(dynamicCategories).map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground px-2 pt-2 pb-0.5">
                            {group.label}
                          </SelectLabel>
                          {group.items.map((c) => (
                            <SelectItem key={c.name} value={c.name} className="text-sm">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>`;

  if (file.includes(oldCategorySelect)) {
    file = file.replace(oldCategorySelect, newCategorySelect);
  } else {
    console.warn("oldCategorySelect not matched in dashboard.product.$id.edit.tsx");
  }

  const oldDesc = `                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Product Description & Styling Notes</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="Describe the fabric, cut, and occasion..."
                    className="rounded-xl"
                  />
                </div>`;

  const newDesc = `                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desc">Product Description & Styling Notes</Label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={generatingAiDesc || !formData.name.trim()}
                      className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {generatingAiDesc ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating description…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>✨ AI Auto-Suggest Description</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    placeholder="Describe the fabric, cut, and occasion..."
                    className="rounded-xl"
                  />
                </div>`;

  if (file.includes(oldDesc)) {
    file = file.replace(oldDesc, newDesc);
  } else {
    console.warn("oldDesc not matched in dashboard.product.$id.edit.tsx");
  }

  fs.writeFileSync('src/routes/_authenticated/dashboard.product.$id.edit.tsx', file, 'utf8');
  console.log('dashboard.product.$id.edit.tsx updated');
}

updateNewProduct();
updateEditProduct();

