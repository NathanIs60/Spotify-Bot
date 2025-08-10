/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;

