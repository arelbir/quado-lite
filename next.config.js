
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
  images: {
    remotePatterns: [
      {
        // https://avatars.githubusercontent.com/u/117963061?v=4
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      }
    ]
  },
  // experimental: {
  //   reactCompiler: isProd,
  // },

};

export default withNextIntl(config);
