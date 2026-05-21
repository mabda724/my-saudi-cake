-- ============================================================
-- Categories table
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name_ar     text not null,
  name_en     text not null,
  slug        text not null unique,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.categories enable row level security;
create policy "categories_public_read"  on public.categories for select using (true);
create policy "categories_auth_manage"  on public.categories for all   using (auth.role() = 'authenticated');

-- ============================================================
-- Products table  (replaces the hard-coded PRODUCTS array)
-- ============================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name_ar       text not null,
  name_en       text not null,
  desc_ar       text,
  desc_en       text,
  price         numeric(10,2) not null,
  category_id   uuid references public.categories(id) on delete set null,
  image_url     text,
  is_active     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.products enable row level security;
create policy "products_public_read"  on public.products for select using (true);
create policy "products_auth_manage"  on public.products for all   using (auth.role() = 'authenticated');

-- ============================================================
-- Orders table
-- ============================================================
create type public.order_status as enum ('confirmed','preparing','ready','delivered');

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text,
  customer_phone text,
  customer_note  text,
  total          numeric(10,2) not null default 0,
  status         public.order_status not null default 'confirmed',
  design_image   text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.orders enable row level security;
create policy "orders_public_insert" on public.orders for insert with check (true);
create policy "orders_auth_manage"   on public.orders for all    using (auth.role() = 'authenticated');
create policy "orders_public_read"   on public.orders for select using (true);

-- ============================================================
-- Order lines (items inside an order)
-- ============================================================
create table if not exists public.order_lines (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  price       numeric(10,2) not null,
  quantity    int not null default 1,
  image_url   text
);

alter table public.order_lines enable row level security;
create policy "order_lines_public_insert" on public.order_lines for insert with check (true);
create policy "order_lines_auth_manage"   on public.order_lines for all    using (auth.role() = 'authenticated');
create policy "order_lines_public_read"   on public.order_lines for select using (true);
