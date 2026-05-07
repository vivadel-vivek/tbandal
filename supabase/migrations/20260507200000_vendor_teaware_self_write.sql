-- =====================================================================
-- Vendor self-management for teaware
--
-- The initial content_catalog migration only granted admin/contributor
-- staff write access to teaware. Phase E lets vendor users manage the
-- teaware they sell — gated to the rows where teaware.vendor matches
-- the display name of a vendors row owned by the caller.
--
-- Tea reviews stay staff-only (vendors can't write reviews of their
-- own teas). Posts likewise — only contributors publish editorial.
-- =====================================================================

-- Helper: does the caller own a vendor whose name matches the given
-- teaware.vendor string? Security-definer + stable so RLS can call it
-- without recursing into the vendors policy.
create function public.owns_teaware_vendor(uid uuid, vendor_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.vendors
    where owner_id = uid and name = vendor_name
  );
$$;

create policy "teaware_vendor_owner_all"
  on public.teaware for all
  using (public.owns_teaware_vendor(auth.uid(), vendor))
  with check (public.owns_teaware_vendor(auth.uid(), vendor));
