const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  entry: {
    player: "./src/player.ts",
    player15: "./src/player15.ts",
    viewer: "./src/viewer.tsx"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "static", to: "" },
        { from: "node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.(woff|woff2)", to: "fonts/[name][ext]" },
      ]
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            passes: 5
          }
        }
      }),
      new HtmlMinimizerPlugin({
        minimizerOptions: {
          conservativeCollapse: false
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
};
