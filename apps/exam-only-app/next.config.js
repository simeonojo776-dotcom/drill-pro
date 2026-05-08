/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tells Next.js to build a static mobile-ready folder called 'out'
  output: 'export',
  
  // Mobile wrappers don't support Next.js dynamic image optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;