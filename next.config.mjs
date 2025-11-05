/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // Allows all HTTP domains (for local development)
      },
    ],
  },
};
export default nextConfig;
