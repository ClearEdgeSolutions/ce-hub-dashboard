-- Run this in Supabase SQL Editor if the HUB does not load data.
-- The website already inserts records. This allows the HUB to read records using the publishable/anon key.

alter table public.leads enable row level security;
alter table public.partners enable row level security;

drop policy if exists "Allow public lead reads for CEA HUB" on public.leads;
drop policy if exists "Allow public partner reads for CEA HUB" on public.partners;

create policy "Allow public lead reads for CEA HUB"
on public.leads
for select
to anon
using (true);

create policy "Allow public partner reads for CEA HUB"
on public.partners
for select
to anon
using (true);
