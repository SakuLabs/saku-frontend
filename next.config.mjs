/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve modern formats to mobile; large savings over PNG/JPEG.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shake barrel imports so only used icons/helpers ship.
    optimizePackageImports: ["lucide-react", "date-fns", "recharts", "framer-motion"],
  },
}

export default nextConfig
