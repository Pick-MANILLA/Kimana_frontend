/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // console.error stays so production failures still reach error monitoring.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  // Already Next's default; pinned so a later change can't silently expose source.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
