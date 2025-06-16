const webpack = require('webpack')
const path = require('path')
const dotenv = require('dotenv')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { version } = require('../../../package.json')

module.exports = (env) => {
  // Carga dotenv con el archivo correspondiente al entorno
  const envVars = dotenv.config({ path: `.env.${env.NODE_ENV}` }).parsed || {}

  return {
    mode: envVars.MODE || 'development',
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'logo.[name].[contenthash].js',
      chunkFilename: 'logo.[name].[contenthash].js',
      publicPath: env.NODE_ENV !== 'local' ? `${envVars.PUBLIC_PATH}/${version.replace(/\./g, '/')}/js/` : '/',
      clean: true,
      library: {
        name: 'logo',
        type: 'umd',
        umdNamedDefine: true
      }
    },
    devtool: 'eval-source-map',
    devServer: {
      port: envVars.PORT || 3000,
      client: {
        logging: 'info',
        progress: true,
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: true
        }
      }, 
      hot: true
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [
            env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|svg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.ejs$/i,
          use: ['html-loader', 'template-ejs-loader']
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', ['@babel/preset-react', { pragma: 'h' }]]
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Logo MFE',
        filename: 'index.html',
        template: path.join(__dirname, 'src', 'index.html'),
        inject: 'head',
        scriptLoading: 'blocking',
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
          'theme-color': '#4285f4'
        }
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars)
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css'
      })
    ],
    optimization: {
      minimize: env.NODE_ENV === 'production',
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
      splitChunks: {
        chunks: 'all'
      }
    },
    resolve: {
      extensions: ['.js', '.jsx', '.scss'],
      alias: {
        process: 'process/browser',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat', // Must be below test-utils
        'react/jsx-runtime': 'preact/jsx-runtime',
        '@eig-builder/core-utils/helpers/runtime-config-helper': path.resolve(
          __dirname,
          '../../../src/helpers/runtime/runtime-config-helper'
        ),
        muitheme: '@eig-builder/core-branding/websitebuilder/variables/_mui-theme',
        brand_variables: '@eig-builder/core-branding/websitebuilder/variables/_variables.scss',
        brand_logo: '@eig-builder/core-branding/websitebuilder/images.json',
        brand_variables_js: '@eig-builder/core-branding/websitebuilder/variables/_variables.json',
        '@eig-builder/module-localization': path.resolve(__dirname, 'src/core-modules/module-localization'),
        '@eig-builder/core-utils/hooks/useFeature': path.resolve(
          __dirname,
          'src/core-modules/core-utils/hooks/useFeature'
        ),
        '@eig-builder/core-utils/helpers/url-helper': path.resolve(
          __dirname,
          'src/core-modules/core-utils/helpers/url-helper'
        ),
        '@eig-builder/core-utils/fetch': path.resolve(__dirname, '../../../src/helpers/utils'),
        base_style: '@eig-builder/core-utils/base-style',
        'logo-scss': path.resolve(__dirname, '../../../src/logomaker/styles/editor.scss'),
        'logo-maker-scss': path.resolve(__dirname, '../../../src/core/logo-maker/style/logo-maker.scss'),
        'logo-blender-main-scss': path.resolve(__dirname, '../../../src/core/logo-maker/style/logo-blender-main.scss'),
        'onboarding-scss': path.resolve(__dirname, '../../../src/modules/onboarding/style/onboarding.scss'),
        helpers: path.resolve(__dirname, '../../../src/helpers'),
        clients: path.resolve(__dirname, '../../../src/clients'),
        core: path.resolve(__dirname, '../../../src/core'),
        modules: path.resolve(__dirname, '../../../src/modules'),
        services: path.resolve(__dirname, '../../../src/services'),
        logomaker: path.resolve(__dirname, '../../../src/logomaker'),
        'hooks/useParams': path.resolve(__dirname, 'src/core-modules/core-utils/helpers/useParams.js'),
        hooks: path.resolve(__dirname, '../../../src/hooks'),
        components: path.resolve(__dirname, '../../../src/components'),
        images: path.resolve(__dirname, '../../../src/images'),
        assets: path.resolve(__dirname, '../../../src/assets'),
        context: path.resolve(__dirname, '../../../src/context'),
        utils: path.resolve(__dirname, '../../../src/utils'),
        constants: path.resolve(__dirname, '../../../src/constants')
      },
      fallback: {
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser')
      }
    }
  }
}
