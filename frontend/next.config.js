/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      // Add your Supabase project URL domain here
    ],
  },
  // Enable SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
