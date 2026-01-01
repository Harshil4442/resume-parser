/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return []; // <-- prevents "undefined/api/..."
    const base = backend.replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${base}/api/:path*` }];
  },
};

module.exports = nextConfig;