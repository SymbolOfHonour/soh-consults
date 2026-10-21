-- Server-only atomic article save, preserving history and enforcing owner-only unpublishing.
create or replace function public.save_writer_article(p_id uuid,p_expected timestamptz,p_actor uuid,p_values jsonb,p_create boolean default false)
returns setof public.news_queue language plpgsql security invoker set search_path=public as $$
declare old public.news_queue; saved public.news_queue; actor_name text; event_id uuid; action_name text; submission public.editor_submissions;
begin
 select name into actor_name from public.editor_team where id=p_actor and active=true for share;
 if not found then raise exception 'Team access is disabled'; end if;
 if p_create then
  select * into submission from public.editor_submissions where id=p_id for update;
  if found and (submission.author_id<>p_actor or submission.status='imported' or submission.updated_at is distinct from p_expected) then raise exception 'Review draft changed or is unavailable'; end if;
  insert into public.news_queue(id,source_name,source_url,title,institution,category,summary,details,image_url,official_source_name,official_source_url,status,source_published_at,created_at,updated_at)
  values(p_id,'S.O.H CONSULTS','manual:'||p_id,p_values->>'title',p_values->>'institution',p_values->>'category',p_values->>'summary',p_values->>'details',nullif(p_values->>'image_url',''),nullif(p_values->>'official_source_name',''),nullif(p_values->>'official_source_url',''),p_values->>'status',case when p_values->>'status'='published' then now() else null end,now(),clock_timestamp()) returning * into saved;
  if submission.id is not null then update public.editor_submissions set status='imported',story_id=p_id,updated_at=clock_timestamp() where id=p_id; end if;
  action_name:=case when saved.status='published' then 'Writer published new article' else 'Writer created article' end;
 else
  select * into old from public.news_queue where id=p_id for update;
  if not found or old.updated_at is distinct from p_expected then return; end if;
  if old.source_name like 'S.O.H System:%' or old.source_name like 'S.O.H Trash:%' or old.source_name like 'S.O.H Opportunity:%' or old.source_name like 'Admin:%' or lower(old.category) like 'admin %' then raise exception 'Article unavailable'; end if;
  if old.status='published' and p_values->>'status'<>'published' then raise exception 'Only the owner may unpublish'; end if;
  event_id:=gen_random_uuid();
  insert into public.news_queue(id,source_name,source_url,title,institution,category,summary,details,status,created_at,updated_at)
  values(event_id,'S.O.H System:history:'||p_id,'system:history:'||p_id||':'||event_id,old.title,'Private admin record','Admin history','Previous update version',jsonb_build_object('action','writer_edit','snapshot',to_jsonb(old))::text,'archived',now(),now());
  update public.news_queue set title=p_values->>'title',institution=p_values->>'institution',category=p_values->>'category',summary=p_values->>'summary',details=p_values->>'details',image_url=nullif(p_values->>'image_url',''),official_source_name=nullif(p_values->>'official_source_name',''),official_source_url=nullif(p_values->>'official_source_url',''),status=p_values->>'status',source_published_at=case when old.status<>'published' and p_values->>'status'='published' then now() else old.source_published_at end,updated_at=clock_timestamp() where id=p_id returning * into saved;
  action_name:=case when p_values->>'writer_action'='restore' then 'Writer restored revision' when old.status<>'published' and saved.status='published' then 'Writer published article' else 'Writer edited article' end;
 end if;
 if saved.status not in ('draft','approved','published','rejected','archived') then raise exception 'Invalid status'; end if;
 event_id:=gen_random_uuid();
 insert into public.news_queue(id,source_name,source_url,title,institution,category,summary,details,status,created_at,updated_at)
 values(event_id,'S.O.H System:audit:'||p_id,'system:audit:'||p_id||':'||event_id,action_name||': '||saved.title,'Private admin record','Admin audit',action_name,jsonb_build_object('action',action_name,'story_id',p_id,'title',saved.title,'details','Writer: '||actor_name||' ('||p_actor||')','at',clock_timestamp())::text,'archived',now(),now());
 return next saved;
end $$;
revoke all on function public.save_writer_article(uuid,timestamptz,uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.save_writer_article(uuid,timestamptz,uuid,jsonb,boolean) to service_role;
