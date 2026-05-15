# Renov Chantier — MVP bêta

Application web **mobile-first** pour artisans en rénovation : photo de chantier, projection visuelle (IA) et fourchette de prix HT indicative.

## Architecture

- **Frontend** : Next.js 14 (App Router, TypeScript), UI sobre (noir / blanc / gris, police Inter).
- **Backend** : FastAPI (Python 3.12), chiffrage côté serveur, appels OpenAI (vision + DALL·E 3).

> **Note produit** : DALL·E 3 est un modèle **texte → image**. La projection s’appuie sur une **description** de votre photo (via le modèle vision) puis sur un prompt de rénovation : l’image n’est pas une transformation géométrique exacte du fichier source, mais une visualisation crédible pour la démo.

## Prérequis

- Node.js 20+ (LTS recommandé)
- Python 3.12+
- Compte OpenAI avec **crédits** ou facturation active (les appels vision + images sont payants ; consultez la grille tarifaire officielle)

## Configuration

### Backend (`backend/.env`)

Copiez `backend/.env.example` vers `backend/.env` et renseignez au minimum :

| Variable | Rôle |
|----------|------|
| `OPENAI_API_KEY` | Clé secrète OpenAI |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules (ex. `http://localhost:3000,https://votre-front.vercel.app`) |
| `OPENAI_VISION_MODEL` | Défaut : `gpt-4o-mini` (moins cher, suffisant pour la bêta) |
| `OPENAI_IMAGE_MODEL` | Défaut : `dall-e-3` |
| `ROOM_RATES_JSON` | Optionnel : surcharge JSON des tarifs au m² |

### Frontend (`frontend/.env.local`)

Copiez `frontend/.env.example` vers `frontend/.env.local` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En production, pointez vers l’URL publique HTTPS de l’API.

## Lancer en local

**Terminal 1 — API**

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # puis éditer .env
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Front**

```bash
cd frontend
copy .env.example .env.local   # puis ajuster l’URL de l’API si besoin
npm install
npm run dev
```

Ouvrez `http://localhost:3000`.

## Déploiement gratuit / freemium (indicatif)

Les offres évoluent : vérifiez les limites sur les sites des éditeurs.

### Frontend sur [Vercel](https://vercel.com)

1. Créez un dépôt Git (GitHub/GitLab) avec ce monorepo.
2. Projet Vercel : répertoire racine = `frontend`, commande build `npm run build`, sortie `.next`.
3. Variables d’environnement Vercel : `NEXT_PUBLIC_API_URL=https://votre-api.example.com` (sans slash final).
4. Déployez ; notez l’URL `https://....vercel.app`.

### Backend sur [Render](https://render.com) (Web Service gratuit avec limitations)

1. **New +** → **Web Service** → connectez le dépôt.
2. Répertoire racine : `backend`.
3. **Build command** : `pip install -r requirements.txt`
4. **Start command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Variables d’environnement : `OPENAI_API_KEY`, `CORS_ORIGINS` (inclure l’URL Vercel), éventuellement `ROOM_RATES_JSON`.
6. Déployez ; utilisez l’URL HTTPS fournie dans `NEXT_PUBLIC_API_URL`.

### Backend sur [Fly.io](https://fly.io)

1. Installez la CLI `flyctl`, puis `fly launch` dans `backend` (Dockerfile fourni).
2. Définissez les secrets : `fly secrets set OPENAI_API_KEY=... CORS_ORIGINS=https://....vercel.app`
3. `fly deploy`

### Fichiers volumineux

Les photos transitent en **multipart** vers l’API. Sur les offres gratuites, surveillez timeouts et taille max des requêtes ; compressez côté mobile si besoin (le front réduit déjà une copie pour l’affichage résultat dans `sessionStorage`).

## Endpoints API

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `GET` | `/health` | Santé du service |
| `POST` | `/api/analyze` | Formulaire `multipart/form-data` avec champ `file` — suggestion pièce / matériaux |
| `POST` | `/api/project` | `file`, `room_type`, `area_m2` — chiffrage + image DALL·E 3 |
| `POST` | `/api/quote` | JSON `{ "room_type", "area_m2" }` — chiffrage seul (sans OpenAI) |

## Structure du dépôt

```
renov-chantier-mvp/
  backend/
    app/
      main.py
      config.py
      services/
        pricing.py
        openai_service.py
    requirements.txt
    Dockerfile
    .env.example
  frontend/
    app/
      layout.tsx
      page.tsx
      result/page.tsx
      globals.css
    lib/
      api.ts
      format.ts
      resizeImage.ts
    package.json
    .env.example
  README.md
```

## Sécurité

- Ne commitez **jamais** `.env` ni `.env.local`.
- Limitez `CORS_ORIGINS` à vos domaines de production.
- Surveillez la consommation OpenAI (tableau de bord + budgets).

## Licence

Projet de démonstration MVP — adaptez la licence selon votre usage commercial.
