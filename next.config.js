/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export as a static site (Netlify will publish /out)
  output: "export",
  images: { unoptimized: true },
};

module.exports = nextConfig;
