-- ArtiVision B2B — schéma initial multi-tenant
-- Tier UX/API FastAPI : economique | standard | premium (≠ eco alias réservé au front Replicate)
-- Types de pièce alignés backend + routes generate : cuisine, salle_de_bain, salon, chambre, autre, wc, bureau, buanderie, couloir

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tables métier
-- -----------------------------------------------------------------------------

create table public.artisans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  company_name text not null,
  siret text,
  specialties text[] not null default '{}',
  logo_url text,
  primary_color text not null default '#0F172A',
  phone text,
  email text not null,
  city text,
  region text,
  vat_rate numeric not null default 10.0,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  links_quota_used int not null default 0,
  links_quota_reset_at timestamptz,
  onboarding_completed boolean not null default false,
  onboarding_step smallint not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.artisans.onboarding_step is '0–4 wizard onboarding ; 4 = terminé côté UI avant flip onboarding_completed';

-- Templates catalogue (seed) — copiés vers pricing_catalogs à la fin de l’onboarding
create table public.catalog_templates (
  id uuid primary key default gen_random_uuid(),
  specialty text not null,
  room_type text not null check (
    room_type in (
      'cuisine',
      'salle_de_bain',
      'salon',
      'chambre',
      'autre',
      'wc',
      'bureau',
      'buanderie',
      'couloir'
    )
  ),
  tier text not null check (tier in ('economique', 'standard', 'premium')),
  price_min_ht numeric not null check (price_min_ht >= 0),
  price_max_ht numeric not null check (price_max_ht >= price_min_ht),
  included_services text[] not null default '{}',
  unique (specialty, room_type, tier)
);

create table public.pricing_catalogs (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  room_type text not null check (
    room_type in (
      'cuisine',
      'salle_de_bain',
      'salon',
      'chambre',
      'autre',
      'wc',
      'bureau',
      'buanderie',
      'couloir'
    )
  ),
  tier text not null check (tier in ('economique', 'standard', 'premium')),
  price_min_ht numeric not null check (price_min_ht >= 0),
  price_max_ht numeric not null check (price_max_ht >= price_min_ht),
  included_services text[] not null default '{}',
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (artisan_id, room_type, tier)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.estimation_links (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'opened', 'completed', 'validated', 'expired')),
  expires_at timestamptz,
  opened_at timestamptz,
  completed_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

create index estimation_links_token_idx on public.estimation_links (token);

create table public.estimations (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.estimation_links (id) on delete cascade,
  room_type text not null,
  area_m2 numeric,
  quality_tier text not null,
  photos_urls text[] not null default '{}',
  ai_analysis jsonb,
  generated_image_url text,
  computed_quote jsonb,
  client_message text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create index estimations_link_id_idx on public.estimations (link_id);

create table public.propositions (
  id uuid primary key default gen_random_uuid(),
  estimation_id uuid not null references public.estimations (id) on delete cascade,
  status text not null default 'submitted'
    check (
      status in ('submitted', 'reviewed', 'adjusted', 'accepted', 'declined')
    ),
  artisan_adjusted_quote jsonb,
  pdf_url text,
  client_signature_name text,
  client_signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- updated_at pricing_catalogs
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger pricing_catalogs_set_updated_at
  before update on public.pricing_catalogs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.artisans enable row level security;
alter table public.catalog_templates enable row level security;
alter table public.pricing_catalogs enable row level security;
alter table public.clients enable row level security;
alter table public.estimation_links enable row level security;
alter table public.estimations enable row level security;
alter table public.propositions enable row level security;

-- Artisans : uniquement sa ligne
create policy "artisans_select_own"
  on public.artisans for select to authenticated
  using (auth.uid() = user_id);

create policy "artisans_insert_own"
  on public.artisans for insert to authenticated
  with check (auth.uid() = user_id);

create policy "artisans_update_own"
  on public.artisans for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Templates : lecture tout utilisateur connecté (onboarding), pas d’écriture client
create policy "catalog_templates_select_authenticated"
  on public.catalog_templates for select to authenticated
  using (true);

-- Pricing catalogs : lignes de son artisan_id uniquement
create policy "pricing_catalogs_all_own_artisan"
  on public.pricing_catalogs for all to authenticated
  using (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  )
  with check (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  );

-- Clients
create policy "clients_all_own_artisan"
  on public.clients for all to authenticated
  using (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  )
  with check (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  );

-- Liens d’estimation
create policy "estimation_links_all_own_artisan"
  on public.estimation_links for all to authenticated
  using (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  )
  with check (
    artisan_id in (select id from public.artisans where user_id = auth.uid())
  );

-- Estimations : via lien appartenant à l’artisan
create policy "estimations_select_own"
  on public.estimations for select to authenticated
  using (
    exists (
      select 1 from public.estimation_links el
      inner join public.artisans a on a.id = el.artisan_id
      where el.id = estimations.link_id and a.user_id = auth.uid()
    )
  );

create policy "estimations_insert_own"
  on public.estimations for insert to authenticated
  with check (
    exists (
      select 1 from public.estimation_links el
      inner join public.artisans a on a.id = el.artisan_id
      where el.id = estimations.link_id and a.user_id = auth.uid()
    )
  );

create policy "estimations_update_own"
  on public.estimations for update to authenticated
  using (
    exists (
      select 1 from public.estimation_links el
      inner join public.artisans a on a.id = el.artisan_id
      where el.id = estimations.link_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.estimation_links el
      inner join public.artisans a on a.id = el.artisan_id
      where el.id = estimations.link_id and a.user_id = auth.uid()
    )
  );

-- Propositions : via estimation → lien → artisan
create policy "propositions_select_own"
  on public.propositions for select to authenticated
  using (
    exists (
      select 1 from public.estimations e
      inner join public.estimation_links el on el.id = e.link_id
      inner join public.artisans a on a.id = el.artisan_id
      where e.id = propositions.estimation_id and a.user_id = auth.uid()
    )
  );

create policy "propositions_insert_own"
  on public.propositions for insert to authenticated
  with check (
    exists (
      select 1 from public.estimations e
      inner join public.estimation_links el on el.id = e.link_id
      inner join public.artisans a on a.id = el.artisan_id
      where e.id = propositions.estimation_id and a.user_id = auth.uid()
    )
  );

create policy "propositions_update_own"
  on public.propositions for update to authenticated
  using (
    exists (
      select 1 from public.estimations e
      inner join public.estimation_links el on el.id = e.link_id
      inner join public.artisans a on a.id = el.artisan_id
      where e.id = propositions.estimation_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.estimations e
      inner join public.estimation_links el on el.id = e.link_id
      inner join public.artisans a on a.id = el.artisan_id
      where e.id = propositions.estimation_id and a.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Accès service_role (bypass RLS) pour routes Next avec SUPABASE_SERVICE_ROLE_KEY :
-- résolution publique /c/[token], quotas, webhooks Stripe, etc.
-- -----------------------------------------------------------------------------
