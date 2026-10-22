-- Private encrypted retry payloads; never include them in browser-facing selects.
alter table public.editor_email_events
  add column if not exists message_id text,
  add column if not exists archive_status text not null default 'unavailable'
    check (archive_status in ('unavailable','pending','saved','failed','expired')),
  add column if not exists encrypted_message text,
  add column if not exists archive_expires_at timestamptz,
  add column if not exists archive_lease_until timestamptz,
  add column if not exists delivery_status text not null default 'unknown'
    check (delivery_status in ('unknown','delivered','delayed','bounced')),
  add column if not exists delivery_checked_at timestamptz;
create unique index if not exists editor_email_message_id_idx
  on public.editor_email_events(message_id) where message_id is not null;
create index if not exists editor_email_archive_retry_idx
  on public.editor_email_events(created_at) where status='accepted' and archive_status in ('pending','failed');
alter table public.editor_email_events enable row level security;
revoke all on public.editor_email_events from public, anon, authenticated;
grant select, insert, update on public.editor_email_events to service_role;
comment on column public.editor_email_events.encrypted_message is
  'AES-256-GCM MIME payload, event-bound; cleared after Sent append or 7 days on next mailbox sync. Key derived from server-only ADMIN_SESSION_SECRET.';
