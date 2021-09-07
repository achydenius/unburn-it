const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (env, argv) => ({
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js', '.glb', '.gltf', '.mp3', '.jpg', '.gif', '.png'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(glb|gltf|mp3|jpg|gif|png)$/,
        type: 'asset/resource',
      },
    ],
  },
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './assets/favicon.ico',
      meta: {
        'og:title': { property: 'og:title', content: 'Unburn It' },
        'og:description': {
          property: 'og:description',
          content:
            'Unburn It is a song that you can play like a game. Upon pressing play you sink through the screen space and your mouse movement changes the structure of the music that flows around. The seed of the composition itself is an eco-greif dirge, which can be bent and morphed into a burner, a banger, and/or disjointed fragments. The amount of interaction is up to you. Altogether the work functions as a composition, an instrument, and a game.',
        },
        'og:image': {
          property: 'og:image',
          content: 'https://unburn.it/social_sharing_image1-compressed.jpg',
        },
        'og:url': { property: 'og:url', content: 'https://unburn.it' },
        'twitter:card': 'summary_large_image',
      },
    }),
    new WebpackPwaManifest({
      name: 'Unburn It',
      publicPath: './',
      icons: [
        { src: path.resolve('./assets/icon-192.png'), sizes: '192x192' },
        { src: path.resolve('./assets/icon-512.png'), sizes: '512x512' },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: './assets/social_sharing_image1-compressed.jpg' }],
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
})
