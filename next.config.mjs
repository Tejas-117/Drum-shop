/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: 'build',
  output: 'standalone',
  future: {
    webpack5: true,
  },
};

export default nextConfig;
