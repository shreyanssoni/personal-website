/** @type {import('next').NextConfig} */
// const withLlamaIndex = require("llamaindex/next");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}

module.exports = nextConfig
