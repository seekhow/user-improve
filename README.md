# 水钰莱H5

<a name="uWlAl"></a>
## 简介
基于[egg-vue-webpack-spa-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate)脚手架设计开发的一个简单分销管理H5

![image.png](https://cdn.nlark.com/yuque/0/2019/png/123451/1564822081553-0e3856b4-b2db-47ee-aba1-7087a239331f.png#align=left&display=inline&height=660&name=image.png&originHeight=825&originWidth=466&size=53281&status=done&width=372.8)

相关工具：[easy-webpack](https://www.yuque.com/easy-team/easywebpack)
<a name="SKPiL"></a>
## 运行
项目需要[Node.js](http://nodejs.cn/)环境，且版本大于v.8.9，数据库使用的[MongoDB](https://www.mongodb.com/)，且版本大于v3，最好为v4
<a name="PXzoE"></a>
### 安装依赖
先配置npm为国内的源: `npm config set registry https://registry.npm.taobao.org` <br />使用npm安装依赖项: `npm i` 
<a name="VLOqv"></a>
### 本地
本地运行： `npm run dev` 
<a name="Erwlb"></a>
### 生产环境
先清除以前的资源： `npm run clean` <br />构建前端资源： `npm run build` <br />启动工程： `npm run start` 
<a name="sg5H6"></a>
## 技术架构
整体使用JavaScript全栈构建，并且使用了[Vue-ssr](https://ssr.vuejs.org/zh/guide/)做了部分页面的服务端渲染，前端开发使用[Vue.js](https://cn.vuejs.org/v2/guide/index.html)+[Vue-router](https://router.vuejs.org/zh/)+[Vuex](https://vuex.vuejs.org/zh/)+[Vant](https://youzan.github.io/vant/1.x/#/zh-CN/intro)，网络请求使用[axios](https://www.kancloud.cn/yunye/axios/234845)，后端开发使用[Egg.js](https://eggjs.org/zh-cn/intro/index.html)+[Mongoose](https://cn.mongoosedoc.top/docs/index.html)，数据库使用[MongoDB](https://www.mongodb.com/)

云服务相关：业务方的要求，图片上传使用了腾讯云的COS对象服务，短信发送使用了腾讯云的SMS短信服务。
<a name="Ix6zS"></a>
## 文件组织

- app // 业务代码
  - controller // 后端路由控制器
  - middleware // 中间件
  - model // 数据表设计
  - service // 后端复杂业务抽象
  - web // 前端业务目录
  - ...
  - router.js // 后端路由配置文件
- config // 配置文件
  - config.default.js // 默认配置
  - config.prod.js // 生产环境配置
  - config.local.js // 本地开发环境配置
- ...
- package.json // 项目依赖等信息
- webpack.config.js // webpack全局配置
- ...
<a name="xkBxV"></a>
## 业务流程

- 用户扫描其他用户的二维码进入注册页面，完成注册，提交注册申请
- 后台对注册申请进行审批，审批通过，用户得到短信提醒可登录进入系统
- 用户可在主界面进行产品信息查看/团队信息查看/业绩查看/积分查看与提现/产品补货/推荐他人/身份升级
- 管理员可进行相关的信息查看与审核
<a name="iVWBT"></a>
## 模块设计
<a name="N3PdV"></a>
### 用户模块
相关数据表：users/apply/validate/upgrade

- 用户的相关信息存储在users
- 用户的注册申请存储在apply
- 用户的升级申请存储在upgrade
- 用户的登录与找回密码的验证码相关存储在validate
<a name="h6Ldu"></a>
### 产品模块
相关数据表：product/combo/plan/level

- 产品的基本信息存储在product
- 产品组合的套餐信息存储在combo
- 产品进货计划信息存储在plan
- 不同用户对应的进货要求存储在level
<a name="ScExz"></a>
### 积分模块
相关数据表：point/refund

- 用户的积分记录存储在point
- 用户的积分提现记录存储在refund
<a name="Fo2B5"></a>
## 前端部分
前端相关的文件都在app/web目录下，app/view目录里为构建生成的文件，不用care
<a name="CP2uL"></a>
### 文件组织

- app/web
  - asset // 不用打包的静态资源
  - component // 服务端渲染使用的组件
  - framework // 框架相关，如Vue,request等
  - **page/app** // 前端路由/页面/组件相关，前端核心业务目录
  - view // 模板文件
<a name="Nc4BS"></a>
### Vue全局配置
配置的位置在app/web/framework/app.js文件里
```javascript
...  
client() {
    Vue.prototype.$http = request;
    Vue.use(Vant);
    Vue.use(Lazyload);
    const options = this.create(window.__INITIAL_STATE__);
    const app = new Vue(options);
    app.$mount('#app');
    return app;
  }
...
```
<a name="02jmX"></a>
### 前端路由
配置文件在page/app/router.index.js<br />动态加载组件，点击才会加载相应的组件
```javascript
import Vue from 'vue';

import VueRouter from 'vue-router';

// import Container from './container.vue';
// import Home from '../container/Home.vue';

Vue.use(VueRouter);

export default function createRouter() {
  return new VueRouter({
    mode: 'history',
    base: '/',
    routes: [
      {
        path: '/login',
        component: () => import('./login.vue'),
      },
      // ...
      {
        path: '/',
        component: () => import('./container.vue'),
        // component: Container,
        children: [
          {
            path: '/', // 首页
            component: () => import('../container/Home.vue'),
            // component: Home,
          },
          // ...
        ]
      },
    ]
  });
}


```
<a name="390Lr"></a>
### 前端页面
一个页面其实就是一个vue文件，登录态的页面都放在了page/app/container目录下，不需要登录态的页面在page/app/router目录下
<a name="Bq5xr"></a>
### 前端请求
请求对象已经挂在Vue全局对象上，在vue组件里，使用 `this.$http` 即可访问，建议页面加载时的请求放在组件的mounted周期里

请求示例：
```javascript
this.$http.get('/api/user/getGrouperList').then(res => {
  if (res && !res.error && Array.isArray(res.data)) {
    this.list = res.data;
  } else {
    this.$toast.fail('获取数据失败');
  }
});
```

请求的全局配置文件在app/web/framework/utils/request.js，即对axios的全局配置
<a name="Jcff4"></a>
### Vuex Store
相关文件在page/app/store目录，因为各页面之间独立性较强，所以没有全部使用Vuex，只有首页服务端渲染预取数据和全局Loading使用了Vuex

<a name="H7k6A"></a>
## 后端部分

