-- Luna's Bouquet — customers, recipients, orders
--
-- Shape: a CUSTOMER (the person who pays) sends flowers to one or more RECIPIENTS.
-- The delivery details live on the recipient, because that is what actually repeats:
-- Mom's house has a gate code, the office has a front-desk instruction, and the same
-- customer uses both. An ORDER points at one customer and one recipient.
--
-- Reads are closed to the browser. The public anon key may INSERT an order (and the
-- customer/recipient rows an order needs) and nothing else. Everything the admin reads
-- goes through /api/admin/*, which uses the service-role key on the server.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- customers

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  email         text not null,
  phone         text,
  notes         text,                    -- Annie's private notes about this customer
  -- Email is the identity key: the order form upserts on it so a repeat customer
  -- lands on their existing record instead of creating a duplicate.
  constraint customers_email_unique unique (email)
);

create index if not exists customers_name_idx on public.customers (lower(name));

-- --------------------------------------------------------------- recipients

create table if not exists public.recipients (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  customer_id         uuid not null references public.customers (id) on delete cascade,
  name                text not null,
  address             text not null,
  gate_code           text,             -- physical-security data; never exposed to the browser
  delivery_notes      text,             -- "leave with the neighbor", "ring twice", dog in yard
  relationship        text,             -- optional: "Mom", "Office", "Assistant"
  -- One row per person-at-an-address for a given customer. Re-ordering to the same
  -- recipient reuses the row (and therefore the gate code) instead of duplicating it.
  constraint recipients_unique_per_customer unique (customer_id, name, address)
);

create index if not exists recipients_customer_idx on public.recipients (customer_id);

-- ------------------------------------------------------------------- orders

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('new', 'confirmed', 'paid', 'delivered', 'cancelled');
  end if;
end
$$;

create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  customer_id           uuid references public.customers (id) on delete set null,
  recipient_id          uuid references public.recipients (id) on delete set null,
  arrangements          text[] not null default '{}',
  custom_details        text,
  card_message          text,
  delivery_instructions text,
  estimated_total       integer not null default 0,
  status                order_status not null default 'new',
  source                text not null default 'website',
  -- What Annie actually charged and actually collected. The website can only ever
  -- estimate; these are filled in by hand once she confirms an order, and they are how
  -- the legacy spreadsheet's payment tracking survives the import.
  amount_charged        integer,
  amount_paid           integer,
  admin_notes           text,          -- "no pinks or purples", "match plates"
  delivered_on          date,          -- the delivery this order is for, when known
  -- Denormalized copies, written at order time. Annie needs to see the order exactly as
  -- it was placed even if the customer later moves or changes their phone number.
  customer_name         text,
  customer_email        text,
  customer_phone        text,
  recipient_name        text,
  recipient_address     text
);

create index if not exists orders_created_idx  on public.orders (created_at desc);
create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_status_idx   on public.orders (status);

-- ---------------------------------------------------------------------- RLS

alter table public.customers  enable row level security;
alter table public.recipients enable row level security;
alter table public.orders     enable row level security;

-- The order form runs in the browser with the anon key, so it needs to write these
-- three rows. It must never be able to read them back — that is what would leak every
-- saved address and gate code to anyone who opened the JS bundle.

drop policy if exists "anon can create a customer" on public.customers;
create policy "anon can create a customer"
  on public.customers for insert to anon with check (true);

drop policy if exists "anon can create a recipient" on public.recipients;
create policy "anon can create a recipient"
  on public.recipients for insert to anon with check (true);

drop policy if exists "anon can place an order" on public.orders;
create policy "anon can place an order"
  on public.orders for insert to anon with check (true);

-- No select/update/delete policies for anon, by design. With RLS on and no policy,
-- those operations return zero rows. The service-role key used by /api/admin/*
-- bypasses RLS entirely, which is why that key must stay server-side only.

-- --------------------------------------------------- upsert helper for the form
--
-- The form needs "find or create" for the customer and recipient, but anon cannot
-- SELECT, so it cannot do the "find" half. This function runs as its owner (security
-- definer), returns only the two ids, and is the single narrow hole in the wall.

create or replace function public.place_order(
  p_customer_name         text,
  p_customer_email        text,
  p_customer_phone        text,
  p_recipient_name        text,
  p_recipient_address     text,
  p_gate_code             text,
  p_arrangements          text[],
  p_custom_details        text,
  p_card_message          text,
  p_delivery_instructions text,
  p_estimated_total       integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id  uuid;
  v_recipient_id uuid;
  v_order_id     uuid;
begin
  insert into public.customers (name, email, phone)
  values (p_customer_name, lower(trim(p_customer_email)), p_customer_phone)
  on conflict (email) do update
    set name  = coalesce(nullif(excluded.name, ''), customers.name),
        phone = coalesce(nullif(excluded.phone, ''), customers.phone)
  returning id into v_customer_id;

  insert into public.recipients (customer_id, name, address, gate_code, delivery_notes)
  values (
    v_customer_id, p_recipient_name, p_recipient_address,
    nullif(p_gate_code, ''), nullif(p_delivery_instructions, '')
  )
  on conflict (customer_id, name, address) do update
    -- Keep the old gate code if this order did not supply one; a blank box on a repeat
    -- order should not wipe a code Annie already relies on.
    set gate_code      = coalesce(nullif(excluded.gate_code, ''), recipients.gate_code),
        delivery_notes = coalesce(nullif(excluded.delivery_notes, ''), recipients.delivery_notes)
  returning id into v_recipient_id;

  insert into public.orders (
    customer_id, recipient_id, arrangements, custom_details, card_message,
    delivery_instructions, estimated_total, source,
    customer_name, customer_email, customer_phone, recipient_name, recipient_address
  ) values (
    v_customer_id, v_recipient_id, coalesce(p_arrangements, '{}'), nullif(p_custom_details, ''),
    nullif(p_card_message, ''), nullif(p_delivery_instructions, ''),
    coalesce(p_estimated_total, 0), 'website',
    p_customer_name, lower(trim(p_customer_email)), p_customer_phone,
    p_recipient_name, p_recipient_address
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(
  text, text, text, text, text, text, text[], text, text, text, integer
) from public;

grant execute on function public.place_order(
  text, text, text, text, text, text, text[], text, text, text, integer
) to anon;
