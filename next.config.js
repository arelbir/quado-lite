
import createJiti from "jiti";
import path from "path";
import createNextIntlPlugin from 'next-intl/plugin';

// This is validation for the environment variables early in the build process.
const jiti = createJiti(new URL(import.meta.url).pathname);
jiti(path.resolve(process.cwd(), "./src/env.js"))

const isProd = process.env.NODE_ENV === "production";

// Initialize next-intl plugin
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import("next").NextConfig} */
const config = {
  // Output standalone for Docker deployment
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

  // Enable compression
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/denetim/audits',
        permanent: false,
      }
    ];
  },

  // Experimental features
  experimental: {
    // Enable React Compiler in production
    // reactCompiler: isProd,
    
    // Optimize server components
    serverComponentsExternalPackages: ['pg', 'postgres', 'drizzle-orm'],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true,
  
  // Production source maps (disable in production for security)
  productionBrowserSourceMaps: false,

};

export default withNextIntl(config);
