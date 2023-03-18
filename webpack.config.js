const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = ( env ) => {
  let config = {
    mode: 'production',
    entry: {
      database: [
        './src/js/components/timer.js',
        './src/js/pages/database.js'
      ],
      signin: './src/js/pages/signin.js',
      "plan-selection": './src/js/pages/plan-selection.js',
      "account": './src/js/pages/account.js',
      "help": './src/js/pages/help.js',
      "meetings": './src/js/pages/meetings.js',
      "accounting-template": './src/js/pages/accounting-template.js',
      "confirm-email": './src/js/pages/confirm-email.js',
      "forgot-password": './src/js/pages/forgot-password.js',
      "reset-password": './src/js/pages/reset-password.js',
      "form": './src/js/pages/form.js',
      "tracking": './src/js/pages/tracking.js',
      index: './src/js/index.js',
    },
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'public/js'),
    },
    module: {
      rules: [
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        }
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: true,
          },
        }),
      ],
    },
  }
  
  if ( env.dev ) {
    config.mode = 'development';
    config.devtool = "inline-source-map";
    config.watch = true;
  }

  return config;
};