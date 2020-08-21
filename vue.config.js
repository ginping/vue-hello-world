
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const port = 8080

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
    // proxy: {
    //   '/': {
    //     target: 'http://127.0.0.1:28080',
    //     changeOrigin: true
    //   }
    // }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
}
