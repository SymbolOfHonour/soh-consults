create table public.community_survey_responses (
 id uuid primary key,
 submitted_at timestamptz not null default now(),
 is_test boolean not null default false,
 role text not null check (length(role) between 1 and 100),
 uses_json text not null check (jsonb_typeof(uses_json::jsonb)='array'),
 challenge text not null check (length(challenge) between 1 and 1500),
 improvement text not null check (length(improvement) between 1 and 1500),
 features_json text not null check (jsonb_typeof(features_json::jsonb)='array'),
 questions text not null default '' check (length(questions)<=2000),
 experience text not null default '' check (length(experience)<=3000),
 name text not null default '' check (length(name)<=120),
 permission text not null default 'no' check (permission in ('no','anonymous','named')),
 source text not null default 'website' check (source in ('website','legacy_sites')),
 check (permission<>'named' or length(trim(name))>0)
);
alter table public.community_survey_responses enable row level security;
revoke all on public.community_survey_responses from public,anon,authenticated;
grant select,insert on public.community_survey_responses to service_role;
create index community_survey_responses_mode_date on public.community_survey_responses(is_test,submitted_at desc,id desc);
create function public.community_survey_counts()
returns table(is_test boolean,total bigint,testimonies bigint,shareable bigint)
language sql stable security invoker set search_path=public
as $$ select is_test,count(*),count(*) filter(where experience<>''),count(*) filter(where experience<>'' and permission<>'no') from public.community_survey_responses group by is_test $$;
revoke all on function public.community_survey_counts() from public,anon,authenticated;
grant execute on function public.community_survey_counts() to service_role;
