/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Prefer BACKEND_URL for server-side proxy
    const backend = process.env.BACKEND_URL;

    // If not set, do NOT add the rewrite (avoids "undefined/api" build failure)
    if (!backend) return [];

    const base = backend.endsWith("/") ? backend.slice(0, -1) : backend;

    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;