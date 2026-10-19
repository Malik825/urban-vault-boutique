CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  compare_at bigint,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews_count integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  condition text NOT NULL DEFAULT 'New',
  status text NOT NULL DEFAULT 'Published',
  badge text,
  views integer NOT NULL DEFAULT 0,
  blurb text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT TO anon
  USING (status = 'Published');

CREATE POLICY "Sellers can view all products"
  ON public.products FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Sellers can create products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Sellers can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Sellers can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (true);

CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  resulting_stock integer NOT NULL,
  reason text NOT NULL DEFAULT 'adjustment',
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stock_movements_product_idx ON public.stock_movements (product_id, created_at DESC);

GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view stock movements"
  ON public.stock_movements FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Sellers can record stock movements"
  ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (sku, slug, name, brand, category, price, compare_at, rating, reviews_count, stock, condition, status, badge, views, blurb, specs) VALUES
('UVB-2001','urban-vault-heavyweight-boxy-tee-washed-charcoal','Urban Vault Heavyweight Boxy Tee — Washed Charcoal','Urban Vault Co.','Shirts',380,450,4.8,24,18,'New','Published','Best seller',870,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Fabric":"280 GSM 100% French Terry Cotton","Fit":"Boxy / Relaxed Drop Shoulder","Gender":"Unisex","Care":"Machine wash cold","Origin":"Imported"}'),
('UVB-2002','retro-chunky-runner-sneakers-cloud-white-bone','Retro Chunky Runner Sneakers — Cloud White / Bone','Urban Vault Co.','Footwear',850,1100,4.9,31,12,'New','Published','Flash deal',1250,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Sole":"Cushioned EVA Midsole","Upper":"Layered Suede & Breathable Mesh","Fit":"True to Size","Sizes":"EU 40 - 45"}'),
('UVB-2003','luxury-cuban-collar-linen-shirt-sand-dune','Luxury Cuban Collar Linen Shirt — Sand Dune','Zara Exclusive','Shirts',420,490,4.8,19,15,'New','Published','New',680,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"100% Pure Organic Linen","Collar":"Open Camp Collar","Fit":"Relaxed Fit","Occasion":"Resort / Smart Casual"}'),
('UVB-2004','multi-pocket-utility-tactical-cargo-pants-olive','Multi-Pocket Utility Tactical Cargo Pants — Olive','Represent Clo','Men',650,780,4.9,38,9,'New','Published','Best seller',1580,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Heavy-duty Ripstop Cotton","Hardware":"Matte Black YKK Zippers","Pockets":"6 Functional Pockets","Ankle":"Adjustable Cinch Ties"}'),
('UVB-2005','oversized-acid-wash-graphic-band-hoodie','Oversized Acid-Wash Graphic Band Hoodie','Essentials FOG','Men',750,890,4.8,27,14,'New','Published','Flash deal',920,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Weight":"450 GSM Heavy Fleece","Hood":"Double-layered Seamless Hood","Fit":"Custom Streetwear Slouch","Print":"Vintage Plastisol Graphic"}'),
('UVB-2006','womens-minimalist-structured-blazer-trouser-set','Women''s Minimalist Structured Blazer & Trouser Set','Zara Exclusive','Women',1200,1450,4.9,42,7,'New','Published','Best seller',1890,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Poly-Viscose Blend","Blazer":"Single-breasted, Notch Lapel","Trouser":"High-waist Wide Leg","Occasion":"Office / Evening"}'),
('UVB-2007','kids-mini-streetwear-tracksuit-set','Kids Mini Streetwear Tracksuit Set — Sage Green','Daily Paper','Kids',320,380,4.8,15,20,'New','Published','New',540,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"French Terry Cotton Blend","Fit":"Relaxed Fit","Ages":"3-12 years","Set":"Hoodie + Jogger Pants"}'),
('UVB-2008','platform-leather-chelsea-boots-midnight-black','Platform Leather Chelsea Boots — Midnight Black','Represent Clo','Footwear',950,1200,4.9,33,6,'New','Published','Flash deal',1650,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Upper":"Full Grain Italian Leather","Sole":"45mm Chunky Platform","Closure":"Elastic Gusset","Sizes":"EU 38 - 45"}'),
('UVB-2009','crossbody-utility-sling-bag-desert-tan','Crossbody Utility Sling Bag — Desert Tan','Trapstar London','Accessories',280,350,4.8,21,25,'New','Published','New',780,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Water-Resistant Cordura Nylon","Capacity":"4L","Strap":"Adjustable Quick-Release","Compartments":"3 Zippered + Hidden Pocket"}'),
('UVB-2010','womens-ribbed-knit-crop-top-off-white','Women''s Ribbed Knit Crop Top — Off White','Nike Sportswear','Women',180,220,4.8,48,30,'New','Published','Best seller',2100,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Premium Ribbed Cotton","Fit":"Slim / Cropped","Neckline":"Crew Neck","Gender":"Women"}'),
('UVB-2011','relaxed-fit-parachute-pants-stone-grey','Relaxed Fit Parachute Pants — Stone Grey','Essentials FOG','Women',480,580,4.9,29,11,'New','Published',NULL,1340,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Lightweight Nylon Ripstop","Waist":"Elastic with Drawstring","Pockets":"Side Cargo + Zip","Ankle":"Toggle Cinch"}'),
('UVB-2012','vintage-washed-cap-earth-brown','Vintage Washed Dad Cap — Earth Brown','Daily Paper','Accessories',120,NULL,4.8,56,40,'New','Published',NULL,3200,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"Washed Cotton Twill","Closure":"Adjustable Metal Buckle","Brim":"Pre-curved","One Size":"Fits Most"}'),
('UVB-2013','mens-slim-fit-chino-shorts-navy','Men''s Slim Fit Chino Shorts — Navy','Nike Sportswear','Men',290,340,4.8,35,16,'New','Published',NULL,1100,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"98% Cotton 2% Elastane","Fit":"Slim / Above Knee","Waist":"Button & Zip","Pockets":"4 Pockets"}'),
('UVB-2014','kids-graphic-tee-pack-3-pack','Kids Graphic Tee Pack — 3 Pack Assorted','Urban Vault Co.','Kids',250,300,4.9,18,22,'New','Published','Flash deal',620,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"100% Organic Cotton","Fit":"Regular Kids Fit","Ages":"4-14 years","Pack":"3 Assorted Graphic Designs"}'),
('UVB-2015','retro-aviator-sunglasses-gold-frame','Retro Aviator Sunglasses — Gold Frame / Green Lens','Trapstar London','Accessories',350,420,4.8,27,15,'New','Published','New',980,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Frame":"Stainless Steel Gold","Lens":"Polarized UV400","Style":"Classic Aviator","Includes":"Hard Case + Cloth"}'),
('UVB-2016','oversized-denim-jacket-light-wash','Oversized Denim Jacket — Light Wash','Essentials FOG','Men',680,800,4.9,22,8,'New','Published',NULL,1450,'100% authentic designer apparel tailored for modern comfort, premium drape, and high street aesthetic. Available for instant delivery or boutique pickup.','{"Material":"100% Heavy Cotton Denim","Fit":"Oversized / Drop Shoulder","Buttons":"Antique Brass","Wash":"Vintage Light Wash"}');