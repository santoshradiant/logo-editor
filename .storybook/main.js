const path = require('path')
const fs = require('fs')

const getDebugPackages = srcPath => {
  const packages = fs.readdirSync(srcPath)
  return packages
    .map(file => path.join(srcPath, file))
    .filter(file => fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'src')))
}

// Get all @eig-builder debuggable packages and add alias
const builderPackages = getDebugPackages(path.join(process.cwd(), 'node_modules/@eig-builder'))

const packagesToDebug = {}
for (const builderPackageKey in builderPackages) {
  const packagePath = builderPackages[builderPackageKey]
  const packageName = packagePath.split('/').pop()
  const alias = '@eig-builder/' + packageName
  packagesToDebug[alias] = packagePath + '/src'
  console.warn(`Debug mode enabled for ${alias}.`)
}

module.exports = {
  stories: ['../src/components/**/*.story.js'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links', '@storybook/addon-a11y', '@storybook/addon-docs'],
  webpackFinal: async config => {
    // do mutation to the config
    config.resolve = {
      ...config.resolve,
      modules: [path.join(process.cwd(), 'node_modules'), path.join(process.cwd(), 'src')],
      alias: {
        authentication_alias: path.join(process.cwd(), 'node_modules/@eig-builder/module-authentication'),
        muitheme: path.join(process.cwd(), 'node_modules/@eig-builder/core-branding/universal/variables/_mui-theme.js'),
        brand_variables_js: path.join(
          process.cwd(),
          'node_modules/@eig-builder/core-branding/universal/variables/_variables.json'
        ),
        brand_logo: path.join(process.cwd(), 'node_modules/@eig-builder/core-branding/websitebuilder/images.json'),
        ...packagesToDebug
      }
    }

    config.module.rules.push(
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // @remove-on-eject-begin
              babelrc: false,
              // @remove-on-eject-end
              presets: [require.resolve('babel-preset-react-app')],
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              highlightCode: true
            }
          }
        ]
      }
    )

    return config
  }
}
