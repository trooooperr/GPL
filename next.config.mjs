/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true, // Allows standard local and dynamic images on Vercel serverless
  },
};

export default nextConfig;
