-- Prevent authenticated clients from bypassing upsert_quotation validation
-- by writing quotation headers/items directly via the PostgREST API.
-- Reads and quotation deletes remain available under RLS.
-- Writes go through security-definer RPC upsert_quotation only.

revoke all on table public.quotations from anon, authenticated;
revoke all on table public.quotation_items from anon, authenticated;

grant select on table public.quotations to authenticated;
grant delete on table public.quotations to authenticated;
grant select on table public.quotation_items to authenticated;

-- Ensure RPC remains callable only by authenticated users
revoke all on function public.upsert_quotation(jsonb) from public, anon;
grant execute on function public.upsert_quotation(jsonb) to authenticated;