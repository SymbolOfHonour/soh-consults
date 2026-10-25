alter table public.community_survey_responses
 add column email_requested boolean not null default false,
 add column receipt_email text not null default '' check(length(receipt_email)<=254),
 add column receipt_status text not null default 'not_requested' check(receipt_status in ('not_requested','pending','accepted','failed','unknown'));
grant update(receipt_status) on public.community_survey_responses to service_role;
