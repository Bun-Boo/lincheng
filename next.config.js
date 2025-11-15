/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure better-sqlite3 is included in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // Don't externalize better-sqlite3
      config.externals = config.externals.filter(
        (external) => typeof external !== 'string' || !external.includes('better-sqlite3')
      );
    }
    return config;
  },
}

module.exports = nextConfig

