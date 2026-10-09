-- ==============================================================================
-- FreshGuard AI — Supabase PostgreSQL Schema & Seed Migration Script
-- Project: https://jchxqmrgngavtiakhdzq.supabase.co
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
    store_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location_label TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    shelf_life_days INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Snapshots Table
CREATE TABLE IF NOT EXISTS public.inventory_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    store_id TEXT REFERENCES public.stores(store_id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(product_id) ON DELETE CASCADE,
    recorded_at TEXT NOT NULL,
    on_hand_qty INTEGER NOT NULL DEFAULT 0,
    received_qty INTEGER DEFAULT 0,
    waste_qty INTEGER DEFAULT 0,
    next_expiry_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Sales History
CREATE TABLE IF NOT EXISTS public.daily_sales (
    sales_id BIGSERIAL PRIMARY KEY,
    store_id TEXT REFERENCES public.stores(store_id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(product_id) ON DELETE CASCADE,
    sales_date TEXT NOT NULL,
    units_sold INTEGER NOT NULL,
    promotion_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coordinator Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
    recommendation_id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(product_id) ON DELETE CASCADE,
    store_id TEXT REFERENCES public.stores(store_id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    discount_pct INTEGER DEFAULT 0,
    timing TEXT NOT NULL,
    confidence NUMERIC(4,2) DEFAULT 0.90,
    rationale TEXT NOT NULL,
    evidence_json JSONB DEFAULT '[]'::jsonb,
    tradeoffs_json JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'PENDING',
    reviewed_by TEXT,
    reviewed_at TEXT,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Review Actions Table
CREATE TABLE IF NOT EXISTS public.review_actions (
    review_id TEXT PRIMARY KEY,
    recommendation_id TEXT REFERENCES public.recommendations(recommendation_id) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    edited_action TEXT,
    edited_quantity INTEGER,
    reviewer_id TEXT NOT NULL,
    reviewer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    event_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    product_name TEXT NOT NULL,
    proposed_action TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    source TEXT DEFAULT 'SUPABASE_CLOUD',
    created_at TEXT NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables the public anon / publishable key to read and write records
-- ==============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon + authenticated)
DROP POLICY IF EXISTS "Public Read stores" ON public.stores;
CREATE POLICY "Public Read stores" ON public.stores FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read products" ON public.products;
CREATE POLICY "Public Read products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read inventory_snapshots" ON public.inventory_snapshots;
CREATE POLICY "Public Read inventory_snapshots" ON public.inventory_snapshots FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read daily_sales" ON public.daily_sales;
CREATE POLICY "Public Read daily_sales" ON public.daily_sales FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read recommendations" ON public.recommendations;
CREATE POLICY "Public Read recommendations" ON public.recommendations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read review_actions" ON public.review_actions;
CREATE POLICY "Public Read review_actions" ON public.review_actions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read audit_events" ON public.audit_events;
CREATE POLICY "Public Read audit_events" ON public.audit_events FOR SELECT TO anon, authenticated USING (true);

-- Allow public write/update access (for review actions and audit trail commits)
DROP POLICY IF EXISTS "Public Insert review_actions" ON public.review_actions;
CREATE POLICY "Public Insert review_actions" ON public.review_actions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update recommendations" ON public.recommendations;
CREATE POLICY "Public Update recommendations" ON public.recommendations FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Insert audit_events" ON public.audit_events;
CREATE POLICY "Public Insert audit_events" ON public.audit_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Stores
INSERT INTO public.stores (store_id, name, location_label, active) VALUES
    ('STORE-01', 'Downtown Supercenter', 'Downtown Metro', true),
    ('STORE-02', 'Westside Market', 'Westside Suburbs', true),
    ('STORE-03', 'North Suburban Center', 'North District', true)
ON CONFLICT (store_id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (product_id, sku, name, category, unit_cost, unit_price, shelf_life_days) VALUES
    ('PROD-MLK-001', 'SKU-DAIRY-101', 'Fresh Whole Organic Milk 1L', 'Dairy', 1.45, 2.89, 7),
    ('PROD-BRD-002', 'SKU-BAKE-204', 'Artisan Sourdough Loaf 500g', 'Bakery', 1.80, 4.50, 2),
    ('PROD-STR-003', 'SKU-PROD-315', 'Organic Sweet Strawberries 400g', 'Produce', 2.10, 4.99, 5),
    ('PROD-YOG-004', 'SKU-DAIRY-108', 'Greek Plain Yogurt 500g', 'Dairy', 1.65, 3.49, 14),
    ('PROD-SLD-005', 'SKU-PROD-402', 'Baby Spinach & Arugula Blend 250g', 'Produce', 1.30, 3.19, 6),
    ('PROD-SAL-006', 'SKU-MEAT-510', 'Atlantic Salmon Fillet 300g', 'Meat', 4.80, 8.99, 3),
    ('PROD-UNK-007', 'SKU-PREP-701', 'Chef Prepared Caesar Salad Bowl', 'Prepared Foods', 2.50, 5.49, 3)
ON CONFLICT (product_id) DO NOTHING;

-- Seed Inventory Snapshots
INSERT INTO public.inventory_snapshots (snapshot_id, store_id, product_id, recorded_at, on_hand_qty, next_expiry_date) VALUES
    ('SNAP-001', 'STORE-01', 'PROD-MLK-001', '2026-10-09 08:00', 110, '2026-10-10'),
    ('SNAP-002', 'STORE-01', 'PROD-BRD-002', '2026-10-09 08:00', 38, '2026-10-09'),
    ('SNAP-003', 'STORE-01', 'PROD-STR-003', '2026-10-09 08:00', 85, '2026-10-11'),
    ('SNAP-004', 'STORE-01', 'PROD-YOG-004', '2026-10-09 08:00', 60, '2026-10-18'),
    ('SNAP-005', 'STORE-01', 'PROD-SLD-005', '2026-10-09 08:00', 18, '2026-10-12')
ON CONFLICT (snapshot_id) DO NOTHING;

-- Seed Initial Recommendations
INSERT INTO public.recommendations (
    recommendation_id, product_id, store_id, risk_level, action_type, title, details,
    quantity, discount_pct, timing, confidence, rationale, evidence_json, tradeoffs_json, status
) VALUES
    (
        'REC-2026-101', 'PROD-MLK-001', 'STORE-01', 'HIGH', 'MARKDOWN',
        'Apply 30% Dynamic Markdown on Batch M1',
        'Discount 65 units expiring in <24 hours from $2.89 to $2.02 to accelerate turnover before evening cutoff.',
        65, 30, 'Execute by 12:00 PM today', 0.92,
        'Historical Friday velocity peaks between 16:00 and 19:00. 30% markdown increases sales elasticity by 2.4x.',
        '["Batch M1 (70 units) expires tomorrow Oct 10.", "Current velocity (21 units/day) leaves 49 units unsold.", "30% price cut clears 92% of at-risk cohort."]'::jsonb,
        '{"margin_impact": -56.55, "avoided_waste_cost": 98.60, "net_estimated_benefit": 42.05}'::jsonb,
        'PENDING'
    ),
    (
        'REC-2026-102', 'PROD-SAL-006', 'STORE-01', 'HIGH', 'TRANSFER',
        'Transfer 15 Units to Westside Branch',
        'Rebalance 15 fillets from Downtown Supercenter to Westside store via scheduled 13:00 refrigerated transfer route.',
        15, 0, 'Dispatch at 13:00 (Arrival 13:45)', 0.88,
        'Westside store experienced unexpected stockout. Downtown holds 22 units above projected 48-hour demand.',
        '["Westside inventory: 0 units; daily velocity: 18 units.", "Transit time is 45 minutes with verified cold capacity."]'::jsonb,
        '{"margin_impact": -12.00, "avoided_waste_cost": 72.00, "net_estimated_benefit": 60.00}'::jsonb,
        'PENDING'
    ),
    (
        'REC-2026-103', 'PROD-SLD-005', 'STORE-01', 'HIGH', 'REPLENISHMENT',
        'Urgent Purchase Order: Reorder 40 Units',
        'Submit supplier purchase order for 40 units immediately with guaranteed tomorrow 07:00 AM delivery.',
        40, 0, 'Transmit PO before 15:00 supplier cut-off', 0.95,
        'On-hand inventory (18 units) will deplete by tomorrow 11:00 AM based on Friday sales velocity.',
        '["Current stock: 18 units; Friday demand: 28 units.", "Supplier lead time: 16 hours."]'::jsonb,
        '{"margin_impact": 0.0, "avoided_waste_cost": 0.0, "net_estimated_benefit": 75.60}'::jsonb,
        'PENDING'
    )
ON CONFLICT (recommendation_id) DO NOTHING;

-- Seed Initial Audit Events
INSERT INTO public.audit_events (event_id, entity_type, entity_id, event_type, actor, product_name, proposed_action, status, notes, source, created_at) VALUES
    ('AUD-901', 'recommendation', 'REC-2026-104', 'REVIEW_APPROVED', 'Store Manager Alex', 'Artisan Sourdough Loaf 500g', '50% Flash Evening Markdown', 'APPROVED', 'Approved for 16:00 evening bakery section special.', 'SUPABASE_CLOUD', '2026-10-09 10:45 AM'),
    ('AUD-902', 'recommendation', 'REC-2026-105', 'REVIEW_APPROVED', 'Assistant Manager Sarah', 'Greek Plain Yogurt 500g', 'Maintain Standard Shelf Display', 'APPROVED', 'Verified during morning inventory walk.', 'SUPABASE_CLOUD', '2026-10-09 09:15 AM')
ON CONFLICT (event_id) DO NOTHING;
