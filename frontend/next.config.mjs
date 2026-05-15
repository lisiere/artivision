/** @type {import('next').NextConfig} */
/**
 * Les routes FastAPI (`/api/context`, `/api/analyze`, `/api/quote`, `/api/project`) sont
 * proxifiées par des **Route Handlers** (`app/api/.../route.ts`) pour pouvoir envoyer
 * l’en-tête `x-vercel-protection-bypass` (voir `lib/internalBackend.ts`).
 * `/api/generate` reste un Route Handler dédié (Replicate).
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
