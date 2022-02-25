## 1.webpack资源管理 
https://webpack.docschina.org/guides/asset-management/
了解各种文件在webpack中如何打包

## 2.webpack output配置项文档 
https://webpack.docschina.org/configuration/output/#output-publicpath

## 3.webpack 管理输出 
https://webpack.docschina.org/guides/output-management/

## 4.webpack 提供几种可选方式，帮助你在代码发生变化后自动编译代码：
  * webpack watch mode(webpack 观察模式)
  * webpack-dev-server
  * webpack-dev-middleware
  多数场景中，你可能需要使用 webpack-dev-server
  https://webpack.docschina.org/guides/development/#%E4%BD%BF%E7%94%A8-webpack-dev-middleware

## 5.webpack HMR 模块热替换
  * https://webpack.docschina.org/guides/hot-module-replacement/#%E5%90%AF%E7%94%A8-hmr （启用HMR）
  * https://webpack.docschina.org/api/hot-module-replacement/      (API)
  * https://webpack.docschina.org/concepts/hot-module-replacement/（实现原理）


## 6.Tree Shaking
  在 ```mode = production```时自动生效，以下为 ```mode = development```时的配置
```javascript
  /**  webpack.config.js **/
  mode: 'development',
  optimization: {
    usedExports: true
  }


 /** packge.json 
  *** 用于配置不需要Tree Shaking的文件
  **/
  sideEffects: false   // 没有不需要的文件
  sideEffects: ["*.css","@babel/polly-fill"]   // css文件不需要  
```
**注意：Tree Shaking只支持ES Module的引入方式**，development下的Tree Shaking后打包出来的文件不会直接删除无用代码，而是做了标记，如下图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190807135337440.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h4eUdyZWVuX2hhbmQ=,size_16,color_FFFFFF,t_70)

## 7.为development 和 production 环境区分配置文件,抽取共同的配置文件```webpack.common.js```
  * 安装```webpack-merge```
  ```npm i webpack-merge -D```
  * merge common 配置和 dev/prod配置，举例dev配置
  ```javascript
const webpack = require('webpack')
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')

const devConfig = {...}
module.exports = merge(commonConfig, devConfig)
  ```

## 8.代码分割 Code Splitting 几种方式 （代码分割和webpack无关，是性能提升的概念）
  **场景：项目引入lodash库，假设引入的lodash有1mb，逻辑代码有1mb，则打包出的main.js有2mb。**
（0）手动代码分割：配置lodash的entry可以把lodash库单独打包，避     免main.js过大，且当业务逻辑发生变化时，只要加载main.js即可
（1）配置 + 同步import
  * 直接在index.js中 ```import _ from 'lodash'```
  * 在 ```webpack.common.js```加入配置
  ```javascript
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
  ```
（2）不配置 + 异步import
  * ```babel-plugin-dynamic-import-webpack```插件可以用于异步 import 加载，只要是异步加载webpack会自动打包为单独的文件，不支持魔法注释
 * 打包出的文件用id命名，如 0.js，可以使用魔法注释设置文件名。注意上述提到的插件非官方，无法使用魔法注释。推荐使用babel官方的 @babel/plugin-syntax-dynamic-import，并在.babelrc 的 plugins 中使用
```json
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```
  
```javascript
function getComponent() {
    return import(/* webpackChunkName:"lodash" */ 'lodash').then(({default: _}) => {
      var element = document.createElement('div')
      element.innerHTML = _.join(['Hello','Lee'],'-')
      return element
    })
  }
getComponent().then(element => {
  document.body.appendChild(element)
})
```
* **实践发现 4.35.3 版本的 webpack 无需插件可直接使用魔法注释** 

(3) SplitChunksPlugin插件

无论是同步的还是异步的方式，都会用到 SplitChunksPlugin这个内置插件，且即使没有配置，webpack也有默认配置https://www.webpackjs.com/plugins/split-chunks-plugin/

```javascript
splitChunks: {
    chunks: "async",  // 在代码分割时只对异步代码生效,all--对同步异步代码都做代码分割，initial--对同步代码做代码分割，需要配合 cacheGroups.vendors的配置
    minSize: 30000, // 引入的模块大于 30kb 才做代码分割
    maxSize: 0,   // 当引入的模块大于maxSize时进一步做分割，一般不配置，因为一般不起作用比如lodash库
    minChunks: 1,   // 当一个模块被用了至少 minChunks 次时会做代码分割
    maxAsyncRequests: 5, // 表示允许入口并行加载的最大请求数，之所以有这个配置也是为了对拆分数量进行限制，不至于拆分出太多模块导致请求数量过多而得不偿失
    maxInitialRequests: 3,  // 入口文件引入的库 如果做代码分割最多只会分割出3个文件
    automaticNameDelimiter: '~',  // 文件生成时的连接服符
    name: true,   // 使cacheGroups里的文件名有效
    cacheGroups: {   // 自定义缓存组，比如同时 import 了 lodash 和 jquery，可以打包到同一个文件下
        vendors: {   // 符合以下规则的会被打包到 vendor 组，所以默认文件名为 vendor~[entry.main].js
            test: /[\\/]node_modules[\\/]/,  // 引入的库是否在 node_modules 下
            priority: -10,   // 优先级，同时符合vendors组和default组，打包到优先级大的组
            filename: 'vendors.js'  // 直接命名vendor组的文件名，即 vendor~[entry.main].js => vendors.js
        },
        default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true   // 如果模块a已经打包过，在模块b中使用了模块a，此时不会在打包b的时候再打包一次a
        }
    }
}
```
* 配置的```optimization.splitChunks```都会对打包有影响，比如异步中虽然配置了```webpackChunkName:"lodash"```，打包后文件名为```vendor~lodash.js```，更改配置可以使打包后的文件名为```lodash```：
```javascript
optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: false,
        default: false
      }
    }
  }
```

## 9.Lazy Loading 懒加载，Chunk 是什么？

```javascript
/**
 * 懒加载
 * 打包出的文件[main.js/verdor~lodash.js]
 * 页面刷新时 network 中显示只请求了 main.js
 * 这样可以加快页面的渲染
 */
function getComponent() {
  return import(/* webpackChunkName:"lodash" */ 'lodash').then(({default: _}) => {
    var element = document.createElement('div')
    element.innerHTML = _.join(['Hello','Lee'],'-')
    return element
  })
}
document.addEventListener('click', () => {
  getComponent().then(element => {
    document.body.appendChild(element)
    resolve()
  })
})
```
- webpack会把入口文件单独拆成一个chunk
- 动态加载得文件webpack会将其拆分为一个chunk
> 一个比较值得看的blog
> https://www.cnblogs.com/kwzm/p/10314827.html


## 10.Prefetching & Preloading
```javascript
document.addEventListener('click', () => {
  import(/* webpackPrefetch: true */'./click.js').then(({default: handle}) => {
    handle();
  }) 
})
```
这会生成```<link rel="prefetch" href="1.bundle.js"> ```并追加到页面头部，浏览器会在闲置时间预取1.bundle.js文件。
将异步执行的代码prefetch，即在主逻辑代码加载完成后再加载未来可能使用到的js，可以提高代码覆盖率。但其实prefetch可能会影响到ajax数据获取，所以prefetch的时间点要按照项目来实际考虑。

## 11.CSS的代码分割
> This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
> https://webpack.docschina.org/plugins/mini-css-extract-plugin/

然后压缩css
```javascript
const TerserJSPlugin = require("terser-webpack-plugin");   // js压缩
const MiniCssExtractPlugin = require("mini-css-extract-plugin")  // 提取css
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // css压缩

const prodConfig = {
  mode: 'production',
  devtool: 'cheap-module-source-map',  // production
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  ...
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].chunk.css'
    })
  ]
 }
```
## 12.webpack与浏览器缓存（Caching）
使用contenthash来更新文件的缓存，旧版本webpack4中可能存在源代码未改变，而打包出的文件contenthash值改变的情况，设置```optimization.runtimeChunk```来解决。
```javascript
optimization: {
    runtimeChunk: {
      name: 'runtime'
    }
  },
output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  }
  ```

## 13.Shimming 的作用
业务场景：在一个使用webpack打包的vue项目中，需要使用一个旧的jquery库，虽然在index.js中引入了jquery ```import $ from 'jquery'```，npm安装启动后页面报错![在这里插入图片描述](https://img-blog.csdnimg.cn/20190808135625277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h4eUdyZWVuX2hhbmQ=,size_16,color_FFFFFF,t_70)
这是由于webpack的打包机制是按模块打包，无法为旧的jquery库引入jquery，此时可以使用webpack自带的一个插件，作用是：当webpack发现某个模块中使用了 $ 这个字符串，会自动引入 jquery 并将其赋值给 $ 变量。
```javascript
 plugins: [
    ...
    new webpack.ProvidePlugin({
      $: 'jquery',
      _: 'lodash',
      _join: ['lodash','join']  //自定义函数名_join 指向 lodash 库中的 join 函数
    })
  ],
```
## 14.imports-loader
修改模块的```this```指向
```javascript
module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
         'babel-loader',
          'imports-loader?this=>window'
        ]
      }
    ]
  }
```
在实际项目中一般会报错
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190808144801673.png)
这是由于```imports-loader```的原理是
```javascript
(function(){...}).call(window)
```
export和import命令可以出现在模块的任何位置，只要处于模块顶层就可以。如果处于块级作用域内，就会报错。这是因为处于条件代码块之中，就没法做静态优化了，违背了ES6模块的设计初衷。

## 15.使用环境变量 env
```javascript

const merge = require('webpack-merge')
const devConfig = require('./webpack.dev.config')
const prodConfig = require('./webpack.prod.config')
 
const commonConfig = {
  //...
}
module.exports = (env) => {
  if(env && env.production) {
    return merge(commonConfig, prodConfig)
  } else {
    return merge(commonConfig, devConfig)
  }
}
```
同时修改package.json中的打包命令：
```json
  "scripts": {
    "build": "webpack --env.production --config ./build/webpack.common.js",
    "dev": "webpack --config ./build/webpack.common.js",
    "start": "webpack-dev-server --config ./build/webpack.common.js"
  }
```
- 这里的--env.production与打包配置文件中的env && env.production对应。
- 如果使用--env.production=abc，则打包配置文件中需要使用env && env.production==='abc'的写法。
- 如果使用--env production，则打包配置文件中需要使用env === 'production'的写法。