/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'ae-pic-a1.aliexpress-media.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae01.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae02.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae03.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae04.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'm.media-amazon.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.kwcdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img-eu.kwcdn.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
