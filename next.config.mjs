/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  outputFileTracingIncludes: {
    '**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
  },
};

export default nextConfig;
