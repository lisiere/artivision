/** @type {import('next').NextConfig} */
function resolveInternalApiUrl() {
  const explicit = process.env.INTERNAL_API_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  // Vercel : `vercel.json` experimentalServices → backend sous `/_/backend` (même host que le front).
  const vercelHost = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercelHost) {
    return `https://${vercelHost}/_/backend`;
  }
  return "http://127.0.0.1:8000";
}

const internalApi = resolveInternalApiUrl();

/**
 * Ne proxifier que les routes FastAPI réelles.
 * Sinon `/api/generate` (Route Handler Next → Replicate) part sur le backend → 502.
 */
const backendApiRewrites = ["context", "analyze", "quote", "project"].map((path) => ({
  source: `/api/${path}`,
  destination: `${internalApi}/api/${path}`,
}));

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
  async rewrites() {
    return backendApiRewrites;
  },
};

export default nextConfig;
