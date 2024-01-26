var modules = require('../modules');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = function (moduleName, env) {
  const portNumber = modules[moduleName]?.port || 50000;
  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    // output: {
    //   publicPath: 'http://localhost:' + portNumber + '/'
    // },
    devServer: {
      host: 'localhost',
      port: portNumber,
      historyApiFallback: {
        index: '/index.html',
      },
      disableHostCheck: true,
      headers: {
        /** Dev */
        // 'Content-Security-Policy': `default-src https://*.fimple.co.uk wss://*.fimple.co.uk http://*.localhost:* http://localhost:* ws://localhost:* blob: data: 'unsafe-eval';font-src 'self' https://*.fimple.co.uk http://*.localhost:* http://localhost:* data:;style-src 'self' https://*.fimple.co.uk http://*.localhost:* http://localhost:* 'unsafe-inline';`,
        // "Access-Control-Allow-Origin": "*",
        // 'Content-Security-Policy': `
        //   default-src https://*.fimple.co.uk wss://*.fimple.co.uk 'unsafe-eval'; font-src 'self' https://*.fimple.co.uk data:;style-src 'self' https://*.fimple.co.uk 'unsafe-inline'; img-src 'self' https://*.fimple.co.uk data:;
        //   style-src 'unsafe-inline';
        //   img-src 'self' data:;
        // `,
        /** Prod */
        // 'Content-Security-Policy': `
        //   default-src https://*.fimple.co.uk wss://*.fimple.co.uk 'unsafe-eval'; font-src 'self' https://*.fimple.co.uk data:;style-src 'self' https://*.fimple.co.uk 'unsafe-inline'; img-src 'self' https://*.fimple.co.uk data:;
        //   style-src 'unsafe-inline';
        //   img-src 'self' data:;
        // `,
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules)/,
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
            loader: 'raw-loader',
          },
        },
        {
          test: /\.bpmnlintrc$/,
          use: [
            {
              loader: 'bpmnlint-loader',
            },
          ],
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
                outputPath: 'fonts/',
              },
            },
          ],
        },
        {
          test: [
            /\.wexbim$/,
            /\.jpg$/,
            /\.docx$/,
            /\.csv$/,
            /\.mp4$/,
            /\.xlsx$/,
            /\.doc$/,
            /\.avi$/,
            /\.webm$/,
            /\.mov$/,
            /\.mp3$/,
            /\.rtf$/,
            /\.pdf$/,
          ],
          loader: 'file-loader',
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        'process.env.LOCAL_ENTRIES': JSON.stringify(process.env.LOCAL_ENTRIES),
        'process.env.LOCAL_RUN': true,
        'process.env.WEB_DOMAIN': JSON.stringify(process.env.WEB_DOMAIN),
      }),
    ],
  };
};
