# Déploiement (Vercel + API hébergée)

Le projet est en **deux parties** : le **frontend Next.js** (Vercel) et l’**API FastAPI** (Render, Railway, Fly.io, etc.). Le front expose `/api/context`, `/api/analyze`, `/api/quote`, `/api/project` via des **Route Handlers** Next qui proxy vers FastAPI (URL **`INTERNAL_API_URL`**, ou par défaut **`https://${VERCEL_URL}/_/backend`** sur Vercel Services — voir `vercel.json` et `lib/internalBackend.ts`).

## 1bis. Vercel Services (expérimental) — front + back sur le même projet

Le fichier **`vercel.json`** définit `experimentalServices` : Next sous `/`, FastAPI sous **`/_/backend`**.

1. Projet Vercel : **Root Directory** = **racine du dépôt** (là où se trouvent `vercel.json`, `frontend/` et `backend/`), **pas** seulement `frontend/`.
2. **`INTERNAL_API_URL`** : tu peux la **laisser vide** sur Vercel : les Route Handlers utilisent alors `https://${VERCEL_URL}/_/backend`.
3. Pour forcer une API externe (Render, etc.), définis quand même **`INTERNAL_API_URL`** comme avant.
4. **`GEMINI_API_KEY`** : obligatoire sur le projet Vercel (Settings → Environment Variables) pour que le service **backend** analyse les photos. Sans elle, `/app` renvoie l’erreur « GEMINI_API_KEY manquante ».
5. **« Authentication Required » sur `/_/backend`** : active **Protection Bypass for Automation** (Vercel → projet → **Deployment Protection**). Vercel injecte alors **`VERCEL_AUTOMATION_BYPASS_SECRET`** sur chaque déploiement ; les Route Handlers l’envoient en **`x-vercel-protection-bypass`** vers le backend. **Redeploy** après activation.

   **Sinon** : désactiver la protection sur les **Preview**, ou **`INTERNAL_API_URL`** (Preview) vers une API **hors Vercel** (ex. Render).

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
| **`GEMINI_API_KEY`** | clé [Google AI Studio](https://aistudio.google.com/apikey) | **Oui** pour le service **backend** (analyse photo `/api/analyze`) |
| **`INTERNAL_API_URL`** | `https://artivision-api.onrender.com` | Oui **sauf** déploiement Vercel Services avec `vercel.json` (voir §1bis) |
| **`REPLICATE_API_TOKEN`** | token Replicate | Oui pour la génération d’images |
| **`NEXT_PUBLIC_SUPABASE_URL`** | URL projet Supabase | Si auth SaaS |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | clé anon | Si auth SaaS |
| **`VERCEL_AUTOMATION_BYPASS_SECRET`** | (injecté par Vercel si « Protection Bypass for Automation » est activé) | Recommandé avec previews protégées + backend `/_/backend` |

4. **Deploy**.  
   **Important** : les Route Handlers lisent **`INTERNAL_API_URL`**, **`VERCEL_URL`** et **`VERCEL_AUTOMATION_BYPASS_SECRET`** à l’**exécution**. Après modification des variables Vercel, un **Redeploy** applique les nouvelles valeurs sur les fonctions serverless.

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
