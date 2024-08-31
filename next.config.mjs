/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  // telemetry: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        // pathname: "/v0/b/**",
      },
    ],
  },
};

export default nextConfig;
