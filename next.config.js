const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.module.rules.push({
  //       test: /\.module\.s(a|c)ss$/,
  //       loader: "sass-loader",
  //       options: {},
  //     });
  //   }
  //   return config;
  // },
  // sassOptions: {
  //   includePaths: [path.join(__dirname, "styles")],
  // },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        // pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
        // pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
