import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.amazonaws.com",
    pathname: "/**",
  },
];

const publicBase = process.env.S3_PUBLIC_BASE_URL;
if (publicBase) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(publicBase).hostname,
      pathname: "/**",
    });
  } catch {
    // ignore invalid S3_PUBLIC_BASE_URL at config time
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
