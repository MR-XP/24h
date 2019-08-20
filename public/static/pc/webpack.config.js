var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path    = require('path');

module.exports = {
  context : path.join(__dirname),
  // devtool: debug ? "inline-sourcemap" : null,
  entry: './src/js/root.js',
  module: {
    rules: [
      {
        test:/\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query:{
          presets: ['es2015','react'],
          plugins: ['react-html-attrs'], //添加组件的插件配置
        }
      },
      //下面是使用 ant-design 的配置文件
      { test: /\.css$/, loader: 'style-loader!css-loader' },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'static/pc/dist/',
    chunkFilename: '[name].[chunkhash:5].chunk.js',
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],

  watch : true//设置webpack，有更新时自动打包
};
