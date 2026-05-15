# Déploiement (Vercel + API hébergée)

Le projet est en **deux parties** : le **frontend Next.js** (Vercel) et l’**API FastAPI** (Render, Railway, Fly.io, etc.). Le front proxifie `/api/context`, `/api/analyze`, `/api/quote`, `/api/project` vers l’API via la variable **`INTERNAL_API_URL`**, sauf sur Vercel **Services** où l’URL par défaut pointe vers `/_/backend` (voir `vercel.json` à la racine du monorepo).

## 1bis. Vercel Services (expérimental) — front + back sur le même projet

Le fichier **`vercel.json`** définit `experimentalServices` : Next sous `/`, FastAPI sous **`/_/backend`**.

1. Projet Vercel : **Root Directory** = **racine du dépôt** (là où se trouvent `vercel.json`, `frontend/` et `backend/`), **pas** seulement `frontend/`.
2. **`INTERNAL_API_URL`** : tu peux la **laisser vide** sur Vercel : `frontend/next.config.mjs` utilise alors `https://${VERCEL_URL}/_/backend` pour les rewrites.
3. Pour forcer une API externe (Render, etc.), définis quand même **`INTERNAL_API_URL`** comme avant.

## 1. API Python (à faire en premier)

### Option A — Render (recommandé, fichier `render.yaml` à la racine)

1. Pousse ce dépôt sur **GitHub** / **GitLab** / **Bitbucket**.
2. [Render](https://render.com) → **New** → **Blueprint** → connecte le dépôt.
3. Valide le service **`artivision-api`** (Dockerfile `backend/Dockerfile`).
4. Dans **Environment**, renseigne au minimum :
   - **`GEMINI_API_KEY`** (obligatoire pour l’analyse vision).
   - **`CORS_ALLOW_VERCEL`** = `true` si tu utilises des URLs `*.vercel.app` avec appels **directs** au backend (`NEXT_PUBLIC_API_URL`). Sinon tu peux laisser `false` si le navigateur ne parle qu’au domaine Vercel (proxy Next).
5. Déploie et copie l’URL publique, ex. `https://artivision-api.onrender.com` (sans `/` final).

### Option B — Docker ailleurs

À la racine du dossier `backend` :

```bash
docker build -t artivision-api .
docker run -e PORT=8000 -e GEMINI_API_KEY=... -p 8000:8000 artivision-api
```

Expose le conteneur derrière HTTPS (obligatoire pour la prod).

## 2. Frontend sur Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importe le **même dépôt**.
2. **Root Directory** : **racine du repo** (recommandé si tu utilises `vercel.json` + Services) ; sinon **`renov-chantier-mvp/frontend`** uniquement si tu déploies **sans** le backend Vercel (API sur Render, etc.).
3. **Environment Variables** (Production **et** Preview si tu veux des previews fonctionnelles) :

| Nom | Exemple | Obligatoire |
|-----|---------|-------------|
| **`INTERNAL_API_URL`** | `https://artivision-api.onrender.com` | Oui **sauf** déploiement Vercel Services avec `vercel.json` (voir §1bis) |
| **`REPLICATE_API_TOKEN`** | token Replicate | Oui pour la génération d’images |
| **`NEXT_PUBLIC_SUPABASE_URL`** | URL projet Supabase | Si auth SaaS |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | clé anon | Si auth SaaS |
| **`SUPABASE_SERVICE_ROLE_KEY`** | clé service (serveur uniquement) | Si routes serveur Supabase |

`NEXT_PUBLIC_API_URL` : laisse **vide** pour que le navigateur appelle `/api/...` sur le même domaine Vercel (recommandé).

4. **Deploy**.  
   **Important** : en l’absence de **`INTERNAL_API_URL`**, le build utilise **`VERCEL_URL`** (injecté par Vercel) pour cibler `/_/backend`. Si tu définis **`INTERNAL_API_URL`**, elle est figée au build : relance un **Redeploy** après changement.

## 3. Supabase (auth / redirections)

Dans le dashboard Supabase → **Authentication** → **URL Configuration** : ajoute

- `https://<ton-projet>.vercel.app`
- `https://<ton-projet>.vercel.app/login`
- `https://<ton-projet>.vercel.app/**` selon la doc Supabase pour les redirections.

## 4. CORS côté API

- Par défaut : liste **`CORS_ORIGINS`** + regex localhost.
- Avec **`CORS_ALLOW_VERCEL=true`** : les origines **`https://*.vercel.app`** sont aussi acceptées (pratique pour les previews et si le front appelle l’API en direct).

Pour un **domaine personnalisé** (ex. `https://app.tondomaine.com`), ajoute-le explicitement dans **`CORS_ORIGINS`** sur l’API.

## 5. Vérifications rapides

- API : `https://<ton-api>/health` → `{"status":"ok"}`.
- Front : page d’accueil + `/app` : chargement du contexte sans erreur réseau.

## Limites

- Je ne peux pas me connecter à ton compte Vercel/Render à ta place : les étapes ci-dessus sont celles à exécuter sur les sites des hébergeurs après `git push`.
