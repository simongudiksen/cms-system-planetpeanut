/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      "ecatptzltpvsknotehbe.supabase.co",
      "images.unsplash.com", // For demo images
    ],
  },
  // Enable SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
