var modules = require('../modules');


module.exports = function (moduleName, env) {
  const portNumber = modules[moduleName].port;
  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    output: {
      filename: '[name].[contenthash].js',
      publicPath: `${process.env.WEB_DOMAIN || ''}/web/${moduleName}/`
    },
    module: {
      // noParse: (content) => { console.log(content); },
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          loader: 'file-loader',
        },
        {
          test: /\.bpmn|\.dmn$/,
          use: {
            loader: 'raw-loader'
          }
        },
        {
          test: /\.bpmnlintrc$/,
          use: [
            {
              loader: 'bpmnlint-loader',
            }
          ]
        },
        {
          test: /\.scss|\.css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/'
              }
            }
          ]
        },
        {
          test: [/\.wexbim$/, /\.jpg$/, /\.docx$/, /\.csv$/, /\.mp4$/, /\.xlsx$/, /\.doc$/, /\.avi$/, /\.webm$/, /\.mov$/, /\.mp3$/, /\.rtf$/, /\.pdf$/],
          loader: 'file-loader',
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
  };
};
