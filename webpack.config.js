const webpack = require('webpack');


const config = {
  entry: './src/index.js',
  output: {
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|ttf)$/,
        use: "url-loader?name=[name].[ext]",
      },
    ]
  }
};

module.exports = config;