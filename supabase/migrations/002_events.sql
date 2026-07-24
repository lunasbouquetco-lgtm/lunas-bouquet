-- Luna's Bouquet — events roll-up
--
-- An EVENT is a thing Annie sold into: a holiday (Mother's Day 2026), a nonprofit
-- gala, a private party, a one-off custom job. Revenue rolls up two ways at once,
-- because both are real:
--
--   1. Orders placed through the website link to an event (orders.event_id) and their
--      totals sum automatically.
--   2. Anything that never touched the website — a custom inquiry, a cash job, all of
--      the historical events — is typed straight in (manual_orders / manual_revenue).
--
-- Displayed totals are the sum of both, so an event can be part-automatic and
-- part-manual without Annie having to think about which is which.
--
-- Expenses are always entered by hand, split the way her spreadsheet already splits
-- them: vases, flowers, misc.

create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  event_date      date,
  -- Holiday / Non-Profit / Custom Order / Private Event — free text so she can add
  -- a category later without a migration.
  type            text,
  status          text not null default 'planned',   -- planned | complete
  -- Typed-in figures for revenue the website never saw.
  manual_orders   integer not null default 0,
  manual_revenue  numeric(10,2) not null default 0,
  -- Expenses, always by hand.
  expense_vases   numeric(10,2) not null default 0,
  expense_flowers numeric(10,2) not null default 0,
  expense_misc    numeric(10,2) not null default 0,
  expense_detail  text,
  notes           text
);

create index if not exists events_date_idx on public.events (event_date desc);

-- Link an order to the event it belongs to. Nullable: most orders won't be tied to
-- a named event, and deleting an event must never delete the orders under it.
alter table public.orders
  add column if not exists event_id uuid references public.events (id) on delete set null;

create index if not exists orders_event_idx on public.orders (event_id);

-- Admin-only. No anon policies at all: with RLS on and nothing granted, the browser
-- key cannot read or write events. Everything goes through /api/admin/* on the
-- service-role key, same as the rest of the order book.
alter table public.events enable row level security;

select 'EVENTS TABLE READY' as result,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='events') as event_columns,
       (select count(*) from information_schema.columns
         where table_schema='public' and table_name='orders' and column_name='event_id') as orders_linked;
