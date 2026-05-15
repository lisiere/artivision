# Supabase — migrations ArtiVision B2B

## Prérequis

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Récupérer **Project URL**, **anon key**, **service role key** → renseigner `frontend/.env.local` (voir `frontend/.env.example`).

## Appliquer le schéma

### Option A — SQL Editor (rapide)

1. Copier-coller le fichier `migrations/20260215120000_init_b2b.sql` dans **SQL Editor** → Run.
2. Copier-coller `seed.sql` → Run.

### Option B — CLI Supabase

```bash
supabase link --project-ref <ref>
supabase db push
```

(adaptez selon votre workflow CLI officiel)

## Auth

- Activez **Email** (et éventuellement Google) dans Authentication → Providers.
- Pour le dev sans boîte mail : désactiver temporairement « Confirm email » dans Auth settings.

## Après migration

- Les artisans obtiennent leur grille **`pricing_catalogs`** à la fin du wizard (`POST /api/artisan/onboarding`).
- Sans seed, l’onboarding échouera avec « Templates catalogue introuvables ».
