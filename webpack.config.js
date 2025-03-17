const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: 'production', // 'development' 또는 'production'
  entry: {  // 각 앱의 엔트리 포인트
    api: './apps/api.js',
    debug: './apps/debug.js',
  },
  output: {
    filename: '[name].js', // 출력 파일명
    path: path.resolve(__dirname, 'dist'), // 출력 경로
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: true, // Minimization 활성화
    minimizer: [new TerserPlugin({ extractComments: false })], // TerserPlugin 사용
  },
  target: 'node',  // Node.js 환경 지정
  externals: [nodeExternals()],  // node_modules에서 모듈 제외
	resolve: {
    fallback: {
    }
  }
};