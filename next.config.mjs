/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || true;

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGitHubPages ? '/Study_partner_AI' : '',
  assetPrefix: isGitHubPages ? '/Study_partner_AI/' : '',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["lucide-react"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
