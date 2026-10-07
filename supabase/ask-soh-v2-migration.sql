-- Ask S.O.H v2 verified knowledge, provenance, audit, analytics and feedback
create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.ask_soh_institutions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  aliases text[] not null default '{}',
  official_domains text[] not null default '{}',
  official_urls jsonb not null default '{}'::jsonb,
  regulator text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ask_soh_facts (
  id uuid primary key default gen_random_uuid(),
  institution_key text references public.ask_soh_institutions(key) on update cascade,
  topic text not null,
  intent text not null,
  value_text text not null,
  answer_text text,
  answer_mode text not null default 'short' check (answer_mode in ('numeric','name','boolean','short','structured','reasoned')),
  academic_session text,
  source_name text not null,
  source_url text not null,
  evidence_text text,
  source_authority smallint not null default 80 check (source_authority between 0 and 100),
  status text not null default 'draft' check (status in ('draft','review','verified','published','due_review','expired','archived')),
  verified_at timestamptz,
  review_due_at timestamptz,
  valid_from timestamptz,
  valid_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ask_soh_facts_lookup on public.ask_soh_facts(institution_key,intent,academic_session,status);
create index if not exists ask_soh_facts_review on public.ask_soh_facts(status,review_due_at);

create table if not exists public.ask_soh_fact_versions (
  id uuid primary key default gen_random_uuid(),
  fact_id uuid not null references public.ask_soh_facts(id) on delete cascade,
  snapshot jsonb not null,
  change_reason text,
  changed_at timestamptz not null default now()
);

create table if not exists public.ask_soh_questions (
  id uuid primary key default gen_random_uuid(),
  question_hash text not null,
  normalized_question text not null,
  institution_key text,
  intent text,
  confidence text,
  answered boolean not null default false,
  source_type text,
  latency_ms integer,
  cache_hit boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ask_soh_questions_trends on public.ask_soh_questions(created_at desc,institution_key,intent);

create table if not exists public.ask_soh_feedback (
  id uuid primary key default gen_random_uuid(),
  question_hash text not null,
  helpful boolean not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.ask_soh_institutions enable row level security;
alter table public.ask_soh_facts enable row level security;
alter table public.ask_soh_fact_versions enable row level security;
alter table public.ask_soh_questions enable row level security;
alter table public.ask_soh_feedback enable row level security;

grant select,insert,update,delete on public.ask_soh_institutions,public.ask_soh_facts,public.ask_soh_fact_versions,public.ask_soh_questions,public.ask_soh_feedback to service_role;

insert into public.ask_soh_institutions(key,name,aliases,official_domains,official_urls,regulator)
values
 ('lasu','Lagos State University',array['LASU','Lagos State University'],array['lasu.edu.ng','lidc.lasu.edu.ng','services.lidc.lasu.edu.ng'],'{"main":"https://lasu.edu.ng/home/","admission":"https://services.lidc.lasu.edu.ng/admissionscreening/"}','JAMB'),
 ('futa','Federal University of Technology Akure',array['FUTA','Federal University of Technology Akure','Federal University of Technology, Akure'],array['futa.edu.ng','admission.futa.edu.ng'],'{"main":"https://www.futa.edu.ng/","admission":"https://admission.futa.edu.ng/"}','JAMB'),
 ('oau','Obafemi Awolowo University',array['OAU','Obafemi Awolowo University'],array['oauife.edu.ng','eportal.oauife.edu.ng'],'{"main":"https://oauife.edu.ng/","admission":"https://eportal.oauife.edu.ng/"}','JAMB'),
 ('jamb','Joint Admissions and Matriculation Board',array['JAMB','Joint Admissions and Matriculation Board'],array['jamb.gov.ng','efacility.jamb.gov.ng'],'{"main":"https://www.jamb.gov.ng/"}',null)
on conflict(key) do update set name=excluded.name,aliases=excluded.aliases,official_domains=excluded.official_domains,official_urls=excluded.official_urls,updated_at=now();
