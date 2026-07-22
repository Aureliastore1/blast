const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // In an npm-workspaces monorepo, dependencies can be hoisted to the repo
  // root node_modules. Point file tracing at the monorepo root so the
  // "standalone" build correctly bundles everything it needs for Docker.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
