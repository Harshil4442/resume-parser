/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL;

    // If BACKEND_URL is not set, don't add any rewrites.
    // This prevents "destination undefined/..." build failures.
    if (!backend) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;