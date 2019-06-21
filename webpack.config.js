'use strict';
module.exports = {
  egg: true,
  framework: 'vue',
  entry: {
    app: 'app/web/page/app/index.js'
  },
  alias: {
    component: 'app/web/component',
    framework: 'app/web/framework',
    store: 'app/web/store',
    vue: 'vue/dist/vue.esm.js',
  },
  dll: ['vue', 'axios', 'vue-router', 'vuex', 'vuex-router-sync'],
  loaders: {
    less: true
  },
  plugins: {
    copy: [{
      from: 'app/web/asset/css/vant.css',
      to: 'asset/css/vant.css'
    },{
      from: 'app/web/asset/css/icon.css',
      to: 'asset/css/icon.css'
    }, {
      from: 'app/web/asset/css/init.css',
      to: 'asset/css/init.css'
    }]
  },
  done() {

  }
};