-- Follow-up for QA installations that already applied the Phase 1 registry migration.
create or replace function public.ask_soh_fact_guard()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare host text; domains text[];
begin
 if TG_OP='UPDATE' then
  insert into public.ask_soh_fact_versions(fact_id,snapshot,change_reason)
  values(old.id,to_jsonb(old),coalesce(new.metadata->>'change_reason','Phase 1 audited update'));
  if (new.institution_key,new.topic,new.intent,new.value_text,new.answer_text,new.academic_session,new.source_url,new.evidence_text,new.source_published_at,new.answer_mode,new.source_authority,new.valid_from,new.valid_until,new.review_due_at,coalesce(new.metadata,'{}'::jsonb)-'change_reason')
     is distinct from (old.institution_key,old.topic,old.intent,old.value_text,old.answer_text,old.academic_session,old.source_url,old.evidence_text,old.source_published_at,old.answer_mode,old.source_authority,old.valid_from,old.valid_until,old.review_due_at,coalesce(old.metadata,'{}'::jsonb)-'change_reason')
     and old.status in ('verified','published') then
    new.status:='review';new.verified_at:=null;
  end if;
 end if;
 if new.status in ('verified','published') then
  if new.verified_at is null or new.verified_at>now()+interval '1 minute' or nullif(trim(new.evidence_text),'') is null or new.conflicting_evidence then
   raise exception 'Verified facts require evidence, verification date and no unresolved conflict';
  end if;
  if new.review_due_at is null or new.review_due_at<=now() then raise exception 'Verified facts require a future review date';end if;
  if new.source_url !~ '^https://[a-zA-Z0-9.-]+(:443)?(/|$)' then raise exception 'Official HTTPS source required';end if;
  host:=lower(substring(new.source_url from '^https://([^/:]+)'));
  select official_domains into domains from public.ask_soh_institutions where key=new.institution_key and active;
  if not exists(select 1 from unnest(domains) d where host=d or right(host,length(d)+1)='.'||d) then raise exception 'Source must belong to registered institution';end if;
 end if;
 new.updated_at:=now();return new;
end $$;
