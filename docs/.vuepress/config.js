module.exports = {
    base: '/MyBlog/',
    title: 'Shayyee 的博客',
    description: 'Shayyee 的博客',
    theme: 'reco',
    themeConfig: {
        subSidebar: 'auto',// 在所有页面中启用自动生成子侧边栏，原 sidebar 仍然兼容
        nav: [
            { text: '首页', link: '/' },
            { 
                text: 'Shayyee 的博客', 
                items: [
                    { text: 'Github', link: 'https://github.com/shayyee' },
                    { text: '掘金', link: 'https://juejin.cn/user/729731451335223/posts' }
                ]
            }
        ],
        sidebar: [
            {
                title: '首页',
                path: '/',
                collapsable: false, // 不折叠
                children: [
                    { title: "首页", path: "/" }
                ]
            },
            {
                title: "Webpack 学习",
                path: '/webpack/webpack4',
                children: [
                    { title: "webpack4 基本概念", path: "/webpack/webpack4" }
                ],
            },
            {
              title: "Typescript 学习",
              path: '/typescript/ConditionalTypes',
              collapsable: false, // 不折叠
              children: [
                  { title: "条件类型", path: "/typescript/ConditionalTypes" },
                  { title: "泛型", path: "/typescript/Generics" }
              ],
            }
        ],
        // locales: {
        //     '/': {
        //       recoLocales: {
        //         homeBlog: {
        //           article: '美文', // 默认 文章
        //           tag: '标识', // 默认 标签
        //           category: '类别', // 默认 分类
        //           friendLink: '友链' // 默认 友情链接
        //         },
        //         pagation: {
        //           prev: '上一页',
        //           next: '下一页',
        //           go: '前往',
        //           jump: '跳转至'
        //         }
        //       }
        //     }
        // }
    },
    locales: {
        '/': {
          lang: 'zh-CN'
        }
    }
}