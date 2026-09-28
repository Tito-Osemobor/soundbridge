/** @type {import('next').NextConfig} */
const demoOnly = process.env.NEXT_PUBLIC_DEMO_ONLY === '1';
const nextConfig = {
  ...(demoOnly ? { output: 'export' } : {
    async rewrites() {
      return [{ source: '/api/:path*', destination: `${process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8080'}/api/:path*` }];
    },
  }),
};

export default nextConfig;
