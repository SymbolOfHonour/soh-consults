import type { NextConfig } from "next";

const privateCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = [

  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Prevent preview and development deployments from being indexed.
const deploymentHeaders = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
  ? [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }]
  : securityHeaders;

const nextConfig: NextConfig = {
  poweredByHeader:false,
  async headers() { return [{ source: "/(.*)", headers: deploymentHeaders },{source:"/api/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow"},{key:"Content-Security-Policy",value:privateCsp}]}]; },
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "soh-consults.vercel.app" }],
      destination: "https://sohconsults.com.ng/:path*",
      permanent: true,
    }];
  },
};

export default nextConfig;
