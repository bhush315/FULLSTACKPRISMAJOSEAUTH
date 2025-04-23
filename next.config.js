/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing output: 'export' to use server-side API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;