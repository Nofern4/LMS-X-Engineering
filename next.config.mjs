/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    '/*': ['./prisma/dev.db', './prisma/schema.prisma'],
  },
};

export default nextConfig;
