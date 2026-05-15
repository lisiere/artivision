# Pivot ArtiVision — SaaS B2B artisans (marque blanche)

Document de référence pour le pivot produit : **comptes artisans**, **catalogue de prix perso**, **liens nominatifs** pour prospects, **validation / proposition**, **Stripe**, etc.

> La spécification détaillée (flux A–D, grille tarifaire freemium, liste des routes) est celle validée dans la conversation produit ; ce fichier résume l’architecture et l’état d’implémentation.

## Principes

- **Conserver le flux IA existant** : Gemini (`/api/analyze`), Replicate (`/api/generate`), chiffrage FastAPI (`/api/quote`, `/api/project`).
- **Multi-tenant** : une ligne `artisans` liée à `auth.users`, données métier filtrées par **RLS** Supabase.
- **Liens publics** `/c/[token]` : résolus côté serveur avec la **service role** ou policies dédiées (Sprint 3) — ne pas exposer de données sensibles dans l’URL.

## Stack ajoutée

| Domaine | Choix |
|--------|--------|
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| Billing | Stripe Billing (Sprint 5) |
| Emails | Resend (Sprint 4+) |
| PDF | `@react-pdf/renderer` (Sprint 4) |

## Schéma SQL

Voir `supabase/migrations/20260215120000_init_b2b.sql` :

- `artisans`, `catalog_templates`, `pricing_catalogs`, `clients`, `estimation_links`, `estimations`, `propositions`
- **RLS** sur toutes les tables métier ; lecture des templates catalogue pour utilisateurs **authenticated**.
- Gammes catalogue alignées API : `economique` \| `standard` \| `premium` (≠ alias `eco` utilisé par Replicate côté front).

Seed données de référence : `supabase/seed.sql` (templates €/m² HT dérivés de `prix_renovation.json` + approximations chambre/autre/couloirs).

## Frontend Next.js

| Zone | Chemin |
|------|--------|
| Marketing | `(marketing)/` |
| Auth + onboarding | `(auth)/login`, `signup`, `onboarding` |
| Espace artisan | `(dashboard)/` — `/dashboard`, `/clients`, `/catalog`, … |
| Démo chantier legacy | `(tool)/app` → **`/app`** conservé |
| API onboarding | `POST /api/artisan/onboarding` |

Variables d’environnement : `frontend/.env.example`.

## Sprint 1 — livré dans le repo

1. Migration + seed SQL sous `supabase/`.
2. Clients Supabase : `lib/supabase/client.ts`, `lib/supabase/server.ts`.
3. **`middleware.ts`** : sessions Supabase ; protection routes artisan ; redirection onboarding si profil incomplet.
4. Pages **login**, **signup**, **onboarding** (wizard 4 étapes).
5. **`POST /api/artisan/onboarding`** : upsert `artisans`, copie des lignes `catalog_templates` (`specialty = default`) → `pricing_catalogs`.
6. Shell **dashboard** + placeholders Sprint 2+.
7. Landing : CTA principal **Créer mon espace pro** → `/signup`, lien secondaire **Démo chantier** → `/app`.

## Sprints suivants (extraits)

- **Sprint 2** : CRUD clients, liens `estimation_links`, partage, édition catalogue.
- **Sprint 3** : `/c/[token]`, refactor `ArtiVisionHome` avec `artisanContext`, quote serveur par `artisan_id`.
- **Sprint 4–6** : propositions, PDF, Resend, Stripe, realtime, landing B2B.

## Hors périmètre

- Dossier `roblox/` : ne pas modifier.
