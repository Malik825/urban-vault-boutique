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
('PRD-1001','macbook-pro-14-m3-pro','MacBook Pro 14 M3 Pro','Apple','Laptops',2450000,2790000,4.7,49,6,'New','Published','Best seller',1133,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"18GB","Storage":"512GB SSD","Processor":"Apple M3 Pro","Screen Size":"14.2\"","Display":"Liquid Retina XDR","Battery":"70Wh","Weight":"1.6kg","Warranty":"12 months"}'),
('PRD-1002','iphone-15-pro-max-256gb','iPhone 15 Pro Max 256GB','Apple','Phones',1590000,1750000,4.4,86,11,'New','Published','Flash deal',1866,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"8GB","Storage":"256GB","Processor":"A17 Pro","Screen Size":"6.7\"","Camera":"48MP triple","Battery":"4441mAh","Weight":"221g","Warranty":"12 months"}'),
('PRD-1003','dell-xps-15-9530','Dell XPS 15 9530','Dell','Laptops',1780000,1980000,4.1,123,4,'New','Published','Flash deal',2599,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"1TB SSD","Processor":"Intel Core i7-13700H","Screen Size":"15.6\"","Display":"FHD+ 500 nits","Battery":"86Wh","Weight":"1.86kg","Warranty":"12 months"}'),
('PRD-1004','hp-spectre-x360-14','HP Spectre x360 14','HP','Laptops',1290000,NULL,4.8,160,9,'New','Published','New',3332,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"512GB SSD","Processor":"Intel Core i7-1355U","Screen Size":"13.5\"","Display":"OLED touch","Battery":"66Wh","Weight":"1.34kg","Warranty":"12 months"}'),
('PRD-1005','lenovo-thinkpad-x1-carbon-g11','Lenovo ThinkPad X1 Carbon G11','Lenovo','Laptops',1650000,1820000,4.5,17,3,'Open box','Published',NULL,4065,'Verified stock, 6-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"32GB","Storage":"1TB SSD","Processor":"Intel Core i7-1365U","Screen Size":"14\"","Display":"WUXGA IPS","Battery":"57Wh","Weight":"1.12kg","Warranty":"6 months"}'),
('PRD-1006','asus-rog-zephyrus-g14','ASUS ROG Zephyrus G14','ASUS','Laptops',1990000,2150000,4.2,54,5,'New','Published','Best seller',798,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"1TB SSD","Processor":"AMD Ryzen 9 7940HS","Screen Size":"14\"","GPU":"RTX 4060","Battery":"76Wh","Weight":"1.65kg","Warranty":"12 months"}'),
('PRD-1007','samsung-galaxy-s24-ultra','Samsung Galaxy S24 Ultra','Samsung','Phones',1480000,1620000,4.9,91,14,'New','Published','New',1531,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"12GB","Storage":"256GB","Processor":"Snapdragon 8 Gen 3","Screen Size":"6.8\"","Camera":"200MP quad","Battery":"5000mAh","Weight":"232g","Warranty":"12 months"}'),
('PRD-1008','ipad-pro-11-m2','iPad Pro 11 M2','Apple','Tablets',1120000,1240000,4.6,128,8,'New','Published','Flash deal',2264,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"8GB","Storage":"256GB","Processor":"Apple M2","Screen Size":"11\"","Display":"Liquid Retina","Battery":"28.6Wh","Weight":"466g","Warranty":"12 months"}'),
('PRD-1009','galaxy-tab-s9','Galaxy Tab S9+','Samsung','Tablets',890000,NULL,4.3,165,0,'New','Published',NULL,4997,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"12GB","Storage":"256GB","Processor":"Snapdragon 8 Gen 2","Screen Size":"12.4\"","Display":"AMOLED 120Hz","Battery":"10090mAh","Weight":"581g","Warranty":"12 months"}'),
('PRD-1010','macbook-air-13-m2','MacBook Air 13 M2','Apple','Laptops',1180000,1320000,4.0,22,12,'Refurbished','Published','Best seller',1730,'Verified stock, 6-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"8GB","Storage":"256GB SSD","Processor":"Apple M2","Screen Size":"13.6\"","Display":"Liquid Retina","Battery":"52.6Wh","Weight":"1.24kg","Warranty":"6 months"}'),
('PRD-1011','hp-elitebook-840-g10','HP EliteBook 840 G10','HP','Laptops',980000,1090000,4.7,59,7,'Open box','Published',NULL,2463,'Verified stock, 6-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"512GB SSD","Processor":"Intel Core i5-1335U","Screen Size":"14\"","Display":"WUXGA","Battery":"51Wh","Weight":"1.36kg","Warranty":"6 months"}'),
('PRD-1012','sony-wh-1000xm5','Sony WH-1000XM5','Samsung','Accessories',385000,430000,4.4,96,22,'New','Published','Flash deal',3196,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"Type":"Over-ear ANC","Battery":"30 hours","Connectivity":"Bluetooth 5.2","Weight":"250g","Warranty":"12 months"}'),
('PRD-1013','apple-watch-series-9-45mm','Apple Watch Series 9 45mm','Apple','Accessories',520000,NULL,4.1,133,16,'New','Published','New',4529,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"Display":"Always-on Retina","Battery":"18 hours","Connectivity":"GPS + Cellular","Weight":"51g","Warranty":"12 months"}'),
('PRD-1014','lenovo-yoga-slim-7i','Lenovo Yoga Slim 7i','Lenovo','Laptops',860000,940000,4.8,30,2,'New','Published',NULL,662,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"512GB SSD","Processor":"Intel Core i5-1340P","Screen Size":"14\"","Display":"2.8K OLED","Battery":"61Wh","Weight":"1.4kg","Warranty":"12 months"}'),
('PRD-1015','asus-zenbook-14-oled','ASUS Zenbook 14 OLED','ASUS','Laptops',920000,NULL,4.5,67,5,'New','Draft',NULL,1395,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"16GB","Storage":"1TB SSD","Processor":"AMD Ryzen 7 7730U","Screen Size":"14\"","Display":"2.8K OLED","Battery":"75Wh","Weight":"1.39kg","Warranty":"12 months"}'),
('PRD-1016','google-pixel-8-pro','Google Pixel 8 Pro','Samsung','Phones',1180000,1290000,4.2,104,6,'New','Published',NULL,2128,'Verified stock, 12-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"12GB","Storage":"256GB","Processor":"Tensor G3","Screen Size":"6.7\"","Camera":"50MP triple","Battery":"5050mAh","Weight":"213g","Warranty":"12 months"}'),
('PRD-1017','iphone-13-128gb','iPhone 13 128GB','Apple','Phones',690000,780000,4.9,141,18,'Refurbished','Published','Best seller',2861,'Verified stock, 6-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"4GB","Storage":"128GB","Processor":"A15 Bionic","Screen Size":"6.1\"","Camera":"12MP dual","Battery":"3240mAh","Weight":"174g","Warranty":"6 months"}'),
('PRD-1018','dell-latitude-5440','Dell Latitude 5440','Dell','Laptops',740000,NULL,4.6,78,0,'Open box','Archived',NULL,3594,'Verified stock, 6-month warranty and same-day dispatch. Enquire on WhatsApp for bulk pricing.','{"RAM":"8GB","Storage":"256GB SSD","Processor":"Intel Core i5-1345U","Screen Size":"14\"","Display":"FHD","Battery":"54Wh","Weight":"1.48kg","Warranty":"6 months"}');