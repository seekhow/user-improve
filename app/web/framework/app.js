import Vue from 'vue';
import Vant, { Lazyload } from 'vant';
import { sync } from 'vuex-router-sync';
import request from './utils/request';

import './vue/filter';
import './vue/directive';
// import 'vant/lib/index.css';
// import 'vant/lib/icon/local.css';

export default class App {
  constructor(config) {
    this.config = config;
  }

  bootstrap() {
    if (EASY_ENV_IS_NODE) {
      return this.server();
    }
    return this.client();
  }

  create(initState) {
    const { index, options, createStore, createRouter } = this.config;
    const store = createStore(initState);
    const router = createRouter();
    sync(store, router);
    return {
      ...index,
      ...options,
      router,
      store
    };
  }

  client() {
    Vue.prototype.$http = request;
    // Vue.mixin({
    //   beforeMount() {
    //     const { preFetch } = this.$options
    //     if (preFetch) {
    //       // 将获取数据操作分配给 promise
    //       // 以便在组件中，我们可以在数据准备就绪后
    //       // 通过运行 `this.dataPromise.then(...)` 来执行其他任务
    //       this.dataPromise = preFetch({
    //         store: this.$store,
    //         route: this.$route
    //       })
    //     }
    //   }
    // });
    Vue.use(Vant);
    Vue.use(Lazyload);
    const options = this.create(window.__INITIAL_STATE__);
    const app = new Vue(options);
    app.$mount('#app');
    return app;
  }

  server() {
    return context => {
      const options = this.create();
      const { store, router } = options;
      router.push(context.state.url);
      return new Promise((resolve, reject) => {
        router.onReady(() => {
          const matchedComponents = router.getMatchedComponents();
          if (!matchedComponents) {
            return reject({ code: '404' });
          }
          return Promise.all(
            matchedComponents.map(component => {
              if (component.preFetch) {
                return component.preFetch(store);
              }
              return null;
            })
          ).then(() => {
            context.state = {
              ...store.state,
              ...context.state
            };
            return resolve(new Vue(options));
          });
        });
      });
    };
  }
}