-- One-minute publishing, atomic history and audit. No public/client access.
create extension if not exists pg_cron;
create schema if not exists soh_editor;
revoke all on schema soh_editor from public,anon,authenticated;
grant usage on schema soh_editor to service_role;
create table if not exists soh_editor.scheduler_state (
 singleton boolean primary key default true check(singleton),
 last_run timestamptz not null, published integer not null, expired integer not null, blocked jsonb not null
);
alter table soh_editor.scheduler_state add column if not exists timer_last_run timestamptz;
alter table soh_editor.scheduler_state enable row level security;
revoke all on soh_editor.scheduler_state from public,anon,authenticated;
grant select,insert,update on soh_editor.scheduler_state to service_role;
create or replace function soh_editor.uri_decode(value text) returns text language sql immutable strict security invoker set search_path='' as $$
 select convert_from(string_agg(case when left(m[1],1)='%' then decode(substr(m[1],2,2),'hex') else convert_to(m[1],'UTF8') end,''::bytea order by n),'UTF8') from regexp_matches(value,'(%[0-9A-Fa-f]{2}|.)','g') with ordinality r(m,n);
$$;
create or replace function soh_editor.uri_encode(value text) returns text language plpgsql immutable strict security invoker set search_path='' as $$
declare raw bytea:=convert_to(value,'UTF8'); result text:=''; b integer; i integer;
begin
 for i in 0..length(raw)-1 loop b:=get_byte(raw,i); if (b between 48 and 57) or (b between 65 and 90) or (b between 97 and 122) or b in (45,95,46,33,126,42,39,40,41) then result:=result||chr(b);else result:=result||'%'||upper(lpad(to_hex(b),2,'0'));end if;end loop;return result;
end $$;
create or replace function soh_editor.run_schedule() returns jsonb language plpgsql security invoker set search_path='' as $$
declare story public.news_queue; saved public.news_queue; meta jsonb; blocks jsonb; due timestamptz; expiry timestamptz; publish_count integer:=0; expire_count integer:=0; blocked jsonb:='[]'::jsonb; event_id uuid; action_name text; next_details text; next_status text; marker text; narrative boolean; issue text;
begin
 if not pg_try_advisory_xact_lock(734288190221) then return jsonb_build_object('published',0,'expired',0,'busy',true);end if;
 for story in select * from public.news_queue where status in ('draft','approved','published') and details like '%[SOH_SMART:%' and source_name not like 'S.O.H System:%' and source_name not like 'S.O.H Trash:%' and source_name not like 'S.O.H Opportunity:%' and source_name not like 'Admin:%' and lower(category) not like 'admin %' for update skip locked loop
  begin
   select m[1] into marker from regexp_matches(story.details,'\[SOH_SMART:([^\]]+)\]','g') with ordinality r(m,n) order by n desc limit 1;
   meta:=soh_editor.uri_decode(marker)::jsonb;due:=nullif(meta->>'schedule','')::timestamptz;expiry:=nullif(meta->>'expires','')::timestamptz;action_name:=null;issue:=null;
   if expiry is not null and expiry<=now() and story.status='published' then next_status:='archived';action_name:='Expired update archived';
   elsif due is not null and due<=now() and story.status in ('draft','approved') then
    if expiry is not null and expiry<=now() then issue:='Publication blocked: expiry has already passed.';
    elsif btrim(story.title)='' then issue:='Publication blocked: headline is missing.';
    else
     marker:=substring(story.details from '\[SOH_BLOCKS:([^\]]+)\]');
     if marker is null then narrative:=btrim(regexp_replace(story.details,'\[SOH_SMART:[^\]]+\]','','g'))<>'';
     else blocks:=soh_editor.uri_decode(marker)::jsonb;
      select exists(select 1 from jsonb_array_elements(blocks) b where
       (b->>'type' in ('paragraph','heading','notice','quote') and btrim(coalesce(b->>'text',''))<>'') or
       (b->>'type'='collapsible' and btrim(coalesce(b->>'title',''))<>'' and btrim(coalesce(b->>'text',''))<>'') or
       (b->>'type'='faq' and exists(select 1 from jsonb_array_elements(b->'entries') e where btrim(coalesce(e->>'question',''))<>'' and btrim(coalesce(e->>'answer',''))<>'')) or
       (b->>'type'='table' and exists(select 1 from jsonb_array_elements(b->'headers') h where btrim(h#>>'{}')<>'') and exists(select 1 from jsonb_array_elements(b->'rows') row_data cross join lateral jsonb_array_elements_text(row_data) c where c~'[[:alpha:]]'))
      ) into narrative;
     end if;
     if not narrative then issue:='Publication blocked: readable article content is missing.';
     elsif (coalesce(story.deadline,'')<>'' and story.deadline_iso is null) then issue:='Publication blocked: verify the deadline date.';
     else next_status:='published';action_name:='Scheduled publication completed';end if;
    end if;
   end if;
   if issue is not null then blocked:=blocked||jsonb_build_array(jsonb_build_object('id',story.id,'title',story.title,'reason',issue));continue;end if;
   if action_name is null then continue;end if;
   event_id:=gen_random_uuid();
   insert into public.news_queue(id,source_name,source_url,title,institution,category,summary,details,status,created_at,updated_at) values(event_id,'S.O.H System:history:'||story.id,'system:history:'||story.id||':'||event_id,story.title,'Private admin record','Admin history','Previous update version',jsonb_build_object('action',case when next_status='published' then 'before_scheduled_publish' else 'before_expiry_archive' end,'snapshot',to_jsonb(story))::text,'archived',now(),now());
   next_details:=story.details;
   if next_status='published' then meta:=meta-'schedule';next_details:=rtrim(regexp_replace(story.details,'\[SOH_SMART:[^\]]+\]','','g'))||E'\n\n[SOH_SMART:'||soh_editor.uri_encode(meta::text)||']';end if;
   update public.news_queue set status=next_status,details=next_details,source_published_at=case when next_status='published' then now() else source_published_at end,updated_at=clock_timestamp() where id=story.id returning * into saved;
   event_id:=gen_random_uuid();
   insert into public.news_queue(id,source_name,source_url,title,institution,category,summary,details,status,created_at,updated_at) values(event_id,'S.O.H System:audit:'||story.id,'system:audit:'||story.id||':'||event_id,action_name||': '||story.title,'Private admin record','Admin audit',action_name,jsonb_build_object('action',action_name,'story_id',story.id,'title',story.title,'details','Automatic database scheduler','at',clock_timestamp())::text,'archived',now(),now());
   if next_status='published' then publish_count:=publish_count+1;else expire_count:=expire_count+1;end if;
  exception when others then blocked:=blocked||jsonb_build_array(jsonb_build_object('id',story.id,'title',story.title,'reason','Invalid scheduling metadata or unavailable record.'));
  end;
 end loop;
 insert into soh_editor.scheduler_state(singleton,last_run,published,expired,blocked) values(true,clock_timestamp(),publish_count,expire_count,blocked) on conflict(singleton) do update set last_run=excluded.last_run,published=excluded.published,expired=excluded.expired,blocked=excluded.blocked;
 return jsonb_build_object('published',publish_count,'expired',expire_count,'blocked',blocked,'processed_at',clock_timestamp());
end $$;
create or replace function public.process_editor_schedule() returns jsonb language sql security invoker set search_path='' as $$ select soh_editor.run_schedule(); $$;
create or replace function public.editor_scheduler_status() returns jsonb language sql security invoker set search_path='' as $$ select to_jsonb(s) from soh_editor.scheduler_state s where singleton=true; $$;
revoke all on all functions in schema soh_editor from public,anon,authenticated;
grant execute on all functions in schema soh_editor to service_role;
revoke all on function public.process_editor_schedule() from public,anon,authenticated;
revoke all on function public.editor_scheduler_status() from public,anon,authenticated;
grant execute on function public.process_editor_schedule(),public.editor_scheduler_status() to service_role;
-- Safe to repeat: named schedules are updated, not duplicated.
select cron.schedule('soh-editor-minute-publishing','* * * * *','select soh_editor.run_schedule(); update soh_editor.scheduler_state set timer_last_run=clock_timestamp() where singleton=true;');
-- Prepare disabled. Enable only after the production activation is approved.
select cron.alter_job((select jobid from cron.job where jobname='soh-editor-minute-publishing'),active:=false);
