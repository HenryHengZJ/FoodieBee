// next.config.js
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images')
//module.exports = withImages()

const withCSS = require('@zeit/next-css')
/*module.exports = withCSS({
    cssLoaderOptions: {
      url: false
    }
  })*/

const withSass = require('@zeit/next-sass')
/*module.exports = 
withSass(
    {cssModules: true},
)*/


module.exports = withPlugins([
    [withCSS], [withSass], withImages
  ]);