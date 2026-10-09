-- Additive Phase 1 migration; apply to QA before production approval.
alter table public.ask_soh_facts add column if not exists source_published_at timestamptz;
alter table public.ask_soh_facts add column if not exists conflicting_evidence boolean not null default false;

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
revoke all on function public.ask_soh_fact_guard() from public,anon,authenticated;
drop trigger if exists ask_soh_fact_guard on public.ask_soh_facts;
create trigger ask_soh_fact_guard before insert or update on public.ask_soh_facts for each row execute function public.ask_soh_fact_guard();

alter table public.ask_soh_facts enable row level security;
alter table public.ask_soh_fact_versions enable row level security;
revoke all on public.ask_soh_facts,public.ask_soh_fact_versions from anon,authenticated;
grant select,insert,update,delete on public.ask_soh_facts to service_role;
grant select on public.ask_soh_fact_versions to service_role;
-- Audit writes belong to the transaction trigger, not a best-effort API request.
revoke insert,update,delete on public.ask_soh_fact_versions from service_role;

insert into public.ask_soh_institutions(key,name,aliases,official_domains,official_urls) values
('unilorin','University of Ilorin',array['unilorin','university of ilorin','university of ilorin kwara'],array['unilorin.edu.ng'],'{}'::jsonb),
('lasu','Lagos State University',array['lasu','lagos state university'],array['lasu.edu.ng','lidc.lasu.edu.ng','services.lidc.lasu.edu.ng'],'{"source0":"https://lasu.edu.ng/home/news/","source1":"https://services.lidc.lasu.edu.ng/admissionscreening/"}'::jsonb),
('futa','Federal University of Technology Akure',array['futa','federal university of technology akure','federal university of technology, akure'],array['futa.edu.ng','admission.futa.edu.ng'],'{}'::jsonb),
('oau','Obafemi Awolowo University',array['oau','obafemi awolowo university'],array['oauife.edu.ng','eportal.oauife.edu.ng'],'{}'::jsonb),
('fuoye','Federal University Oye-Ekiti',array['fuoye','federal university oye ekiti','federal university oye-ekiti'],array['fuoye.edu.ng'],'{"source0":"https://putme.fuoye.edu.ng/utme/","source1":"https://news.fuoye.edu.ng/"}'::jsonb),
('lasustech','Lagos State University of Science and Technology',array['lasustech','lagos state university of science and technology'],array['lasustech.edu.ng','admission.lasustech.edu.ng'],'{}'::jsonb),
('uniosun','Osun State University',array['uniosun','osun state university'],array['uniosun.edu.ng'],'{"source0":"https://admissions.uniosun.edu.ng/"}'::jsonb),
('oou','Olabisi Onabanjo University',array['oou','olabisi onabanjo university'],array['oouagoiwoye.edu.ng'],'{}'::jsonb),
('lasued','Lagos State University of Education',array['lasued','lagos state university of education'],array['lasued.edu.ng'],'{}'::jsonb),
('yabatech','Yaba College of Technology',array['yabatech','yaba college of technology'],array['yabatech.edu.ng'],'{}'::jsonb),
('jamb','Joint Admissions and Matriculation Board',array['jamb','joint admissions and matriculation board'],array['jamb.gov.ng'],'{}'::jsonb),
('waec','West African Examinations Council',array['waec','west african examinations council'],array['waec.org','waecnigeria.org','waecdirect.org'],'{}'::jsonb),
('neco','National Examinations Council',array['neco','national examinations council'],array['neco.gov.ng'],'{}'::jsonb),
('nysc','National Youth Service Corps',array['nysc','national youth service corps'],array['nysc.gov.ng'],'{}'::jsonb)
on conflict(key) do update set name=excluded.name,aliases=excluded.aliases,official_domains=excluded.official_domains,official_urls=ask_soh_institutions.official_urls||excluded.official_urls,updated_at=now();

-- Optional semantic retrieval: never turn an arbitrary nearest neighbour into an answer.
-- Production currently lacks embedding; preserve keyword-only compatibility there.
do $$ begin
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='ask_soh_facts' and column_name='embedding') then
 execute $fn$create or replace function public.match_ask_soh_facts(query_embedding extensions.vector(1536),match_count int default 8)
 returns setof public.ask_soh_facts language sql stable security definer set search_path=public,extensions as $body$
 select * from public.ask_soh_facts where embedding is not null and status in ('verified','published')
 and verified_at is not null and review_due_at>now() and not conflicting_evidence and nullif(trim(evidence_text),'') is not null
 and (valid_from is null or valid_from<=now()) and (valid_until is null or valid_until>=now())
 and embedding <=> query_embedding < 0.25
 order by embedding <=> query_embedding limit greatest(1,least(match_count,20));
 $body$ $fn$;
 end if;
end $$;
