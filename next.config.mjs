/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production ready: Enable strict checks, remove ignoreBuildErrors
  typescript: {
    ignoreBuildErrors: false, 
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
