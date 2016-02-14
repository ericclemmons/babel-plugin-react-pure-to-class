import path from "path";

export default {
  entry: {
    client: [
      "./src/client.js",
    ]
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel",
        query: {
          babelrc: false,
          cacheDirectory: true,
          passPerPreset: true,
          presets: [
            {
              plugins: [
                ["react-transform", {
                  transforms: [{
                    transform: "react-transform-hmr",
                    imports: ["react"],
                    locals: ["module"],
                  }],
                }],
              ],
            },
            "react",
            "es2015",
            "stage-0",
          ],
        },
        exclude: /node_modules/,
      },
    ],
  },

  output: {
    chunkFilename: "[id].[hash:5]-[chunkhash:7].js",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    filename: "[name].js",
    libraryTarget: "var",
    path: path.join(__dirname, "build/client"),
    publicPath: "/",
  },
};
