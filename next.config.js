/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'ae-pic-a1.aliexpress-media.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae01.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae02.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae03.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ae04.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.alicdn.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
