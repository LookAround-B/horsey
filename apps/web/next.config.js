/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['database', 'shared'],
}

module.exports = nextConfig
