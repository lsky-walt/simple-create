
const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin");


module.exports = {
  entry: {
    index: [path.resolve(__dirname, "../src/index.js")]
  },
  output: {
    filename: '[name].[chunkhash].bundle.js',
    path:  path.resolve(__dirname, '../dist'),
    chunkFilename: '[name].[chunkhash].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.', '.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    'prop-types': 'window.PropTypes',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: 'ejs-loader',
            options: {
              esModule: false
            }
          }
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|svg|ttf|woff)$/,
        use: ['file-loader?name=[hash:base64:7].[ext]'],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
              importLoaders: 2,
            },
          },
          'postcss-loader',
          {
            loader: 'less-loader',
          },
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, "../index.ejs"),
      filename: path.resolve(__dirname, '../dist/index.html')
    })
  ]
};