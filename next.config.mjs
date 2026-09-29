/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Activity photography still lives in the old site's blob store; nothing is re-hosted yet.
  images: { unoptimized: true },
}

export default nextConfig
