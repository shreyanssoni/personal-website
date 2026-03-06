import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/newsletter",
        destination: "/news",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "thedailyvibecode.vercel.app",
          },
        ],
        destination: "/news",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
