-- QMS: quotations schema, RLS, and atomic upsert RPC

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quotation_number text not null,
  customer_name text not null,
  company_name text,
  email text,
  phone text,
  quotation_date date not null,
  valid_until date,
  subtotal numeric(14, 2) not null check (subtotal >= 0),
  gst_rate numeric(5, 2) not null default 18 check (gst_rate >= 0 and gst_rate <= 100),
  gst numeric(14, 2) not null check (gst >= 0),
  total numeric(14, 2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotations_valid_until_check
    check (valid_until is null or valid_until >= quotation_date),
  constraint quotations_user_number_unique unique (user_id, quotation_number)
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  product_name text not null,
  quantity numeric(14, 3) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  discount numeric(5, 2) not null default 0 check (discount >= 0 and discount <= 100),
  gross_amount numeric(14, 2) not null check (gross_amount >= 0),
  discount_amount numeric(14, 2) not null check (discount_amount >= 0),
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists quotations_user_id_idx on public.quotations (user_id);
create index if not exists quotations_user_created_idx on public.quotations (user_id, created_at desc);
create index if not exists quotations_user_number_idx on public.quotations (user_id, quotation_number);
create index if not exists quotation_items_quotation_id_idx on public.quotation_items (quotation_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quotations_set_updated_at on public.quotations;
create trigger quotations_set_updated_at
  before update on public.quotations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

drop policy if exists "quotations_select_own" on public.quotations;
create policy "quotations_select_own"
  on public.quotations for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "quotations_insert_own" on public.quotations;
create policy "quotations_insert_own"
  on public.quotations for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "quotations_update_own" on public.quotations;
create policy "quotations_update_own"
  on public.quotations for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "quotations_delete_own" on public.quotations;
create policy "quotations_delete_own"
  on public.quotations for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "quotation_items_select_own" on public.quotation_items;
create policy "quotation_items_select_own"
  on public.quotation_items for select
  to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quotation_items_insert_own" on public.quotation_items;
create policy "quotation_items_insert_own"
  on public.quotation_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quotation_items_update_own" on public.quotation_items;
create policy "quotation_items_update_own"
  on public.quotation_items for update
  to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and q.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quotation_items_delete_own" on public.quotation_items;
create policy "quotation_items_delete_own"
  on public.quotation_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and q.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Money helpers (paise-based rounding to 2 decimals)
-- ---------------------------------------------------------------------------

create or replace function public.round_money(value numeric)
returns numeric
language sql
immutable
as $$
  select round(coalesce(value, 0), 2);
$$;

-- ---------------------------------------------------------------------------
-- Atomic create / update quotation + items
-- ---------------------------------------------------------------------------

create or replace function public.upsert_quotation(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_quotation_id uuid;
  v_existing_id uuid;
  v_item jsonb;
  v_qty numeric;
  v_price numeric;
  v_discount numeric;
  v_gross numeric;
  v_discount_amount numeric;
  v_net numeric;
  v_subtotal numeric := 0;
  v_gst_rate numeric;
  v_gst numeric;
  v_total numeric;
  v_item_count int := 0;
  v_email text;
  v_valid_until date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_existing_id := nullif(payload->>'id', '')::uuid;
  v_gst_rate := public.round_money(coalesce((payload->>'gst_rate')::numeric, 18));
  v_email := nullif(trim(coalesce(payload->>'email', '')), '');
  v_valid_until := nullif(payload->>'valid_until', '')::date;

  if coalesce(trim(payload->>'customer_name'), '') = '' then
    raise exception 'Customer name is required';
  end if;

  if coalesce(trim(payload->>'quotation_number'), '') = '' then
    raise exception 'Quotation number is required';
  end if;

  if coalesce(payload->>'quotation_date', '') = '' then
    raise exception 'Quotation date is required';
  end if;

  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Email is invalid';
  end if;

  if v_gst_rate < 0 or v_gst_rate > 100 then
    raise exception 'GST rate must be between 0 and 100';
  end if;

  if v_valid_until is not null and v_valid_until < (payload->>'quotation_date')::date then
    raise exception 'Valid until cannot be before quotation date';
  end if;

  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') < 1 then
    raise exception 'At least one product is required';
  end if;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    if coalesce(trim(v_item->>'product_name'), '') = '' then
      raise exception 'Product name is required';
    end if;

    v_qty := (v_item->>'quantity')::numeric;
    v_price := (v_item->>'unit_price')::numeric;
    v_discount := coalesce((v_item->>'discount')::numeric, 0);

    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantity must be greater than 0';
    end if;

    if v_price is null or v_price < 0 then
      raise exception 'Unit price cannot be negative';
    end if;

    if v_discount < 0 or v_discount > 100 then
      raise exception 'Discount must be between 0 and 100';
    end if;

    v_gross := public.round_money(v_qty * v_price);
    v_discount_amount := public.round_money(v_gross * v_discount / 100);
    v_net := public.round_money(v_gross - v_discount_amount);
    v_subtotal := v_subtotal + v_net;
    v_item_count := v_item_count + 1;
  end loop;

  v_subtotal := public.round_money(v_subtotal);
  v_gst := public.round_money(v_subtotal * v_gst_rate / 100);
  v_total := public.round_money(v_subtotal + v_gst);

  if v_existing_id is not null then
    select id into v_quotation_id
    from public.quotations
    where id = v_existing_id and user_id = v_user_id;

    if v_quotation_id is null then
      raise exception 'Quotation not found';
    end if;

    update public.quotations set
      quotation_number = trim(payload->>'quotation_number'),
      customer_name = trim(payload->>'customer_name'),
      company_name = nullif(trim(coalesce(payload->>'company_name', '')), ''),
      email = v_email,
      phone = nullif(trim(coalesce(payload->>'phone', '')), ''),
      quotation_date = (payload->>'quotation_date')::date,
      valid_until = v_valid_until,
      subtotal = v_subtotal,
      gst_rate = v_gst_rate,
      gst = v_gst,
      total = v_total
    where id = v_quotation_id;

    delete from public.quotation_items where quotation_id = v_quotation_id;
  else
    insert into public.quotations (
      user_id,
      quotation_number,
      customer_name,
      company_name,
      email,
      phone,
      quotation_date,
      valid_until,
      subtotal,
      gst_rate,
      gst,
      total
    ) values (
      v_user_id,
      trim(payload->>'quotation_number'),
      trim(payload->>'customer_name'),
      nullif(trim(coalesce(payload->>'company_name', '')), ''),
      v_email,
      nullif(trim(coalesce(payload->>'phone', '')), ''),
      (payload->>'quotation_date')::date,
      v_valid_until,
      v_subtotal,
      v_gst_rate,
      v_gst,
      v_total
    )
    returning id into v_quotation_id;
  end if;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_qty := (v_item->>'quantity')::numeric;
    v_price := (v_item->>'unit_price')::numeric;
    v_discount := coalesce((v_item->>'discount')::numeric, 0);
    v_gross := public.round_money(v_qty * v_price);
    v_discount_amount := public.round_money(v_gross * v_discount / 100);
    v_net := public.round_money(v_gross - v_discount_amount);

    insert into public.quotation_items (
      quotation_id,
      product_name,
      quantity,
      unit_price,
      discount,
      gross_amount,
      discount_amount,
      amount
    ) values (
      v_quotation_id,
      trim(v_item->>'product_name'),
      v_qty,
      public.round_money(v_price),
      public.round_money(v_discount),
      v_gross,
      v_discount_amount,
      v_net
    );
  end loop;

  return v_quotation_id;
end;
$$;

revoke all on function public.upsert_quotation(jsonb) from public, anon;
grant execute on function public.upsert_quotation(jsonb) to authenticated;

-- Direct table writes would let clients set totals without matching line items.
-- Persist only through upsert_quotation; keep select + quotation delete under RLS.
revoke all on table public.quotations from anon, authenticated;
revoke all on table public.quotation_items from anon, authenticated;
grant select on table public.quotations to authenticated;
grant delete on table public.quotations to authenticated;
grant select on table public.quotation_items to authenticated;
