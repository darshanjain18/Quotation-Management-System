-- Restrict direct table writes; mutations go through upsert_quotation.

revoke all on table public.quotations from anon, authenticated;
revoke all on table public.quotation_items from anon, authenticated;

grant select on table public.quotations to authenticated;
grant delete on table public.quotations to authenticated;
grant select on table public.quotation_items to authenticated;

revoke all on function public.upsert_quotation(jsonb) from public, anon;
grant execute on function public.upsert_quotation(jsonb) to authenticated;