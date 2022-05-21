const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const dist = path.resolve(__dirname, "dist");

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: "development",
  performance: {
    maxAssetSize: 300000,
  },
  entry: {
    index: "./js/index.js"
  },
  output: {
    path: dist,
  },
  devServer: {
    static :"/"
  },
  plugins: [
    new CopyPlugin({
      patterns: [path.resolve(__dirname, "static")]
    }),
  ]
};
