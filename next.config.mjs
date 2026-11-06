/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy browser calls to the backend through this dev server so auth
  // cookies are first-party (localhost:3000) and CORS doesn't apply.
  // Set NEXT_PUBLIC_API_URL=/backend and BACKEND_URL=<real backend origin>.
  async rewrites() {
    const backend = process.env.BACKEND_URL?.replace(/\/$/, '');
    if (!backend) return [];
    return [{ source: '/backend/:path*', destination: `${backend}/:path*` }];
  },
};

export default nextConfig;
