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
        path: '/share',
        component: () => import('./Share.vue'),
      },
      {
        path: '/login',
        component: () => import('./login.vue'),
      },
      {
        path: '/register',
        component: () => import('./register.vue'),
      },
      {
        path: '/forget',
        component: () => import('./forget.vue'),
      },
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
          {
            path: '/check', // 审核资质
            component: () => import('../container/CheckList.vue'),
          },
          {
            path: '/check-detail/:id', // 审核详情页面
            component: () => import('../container/CheckDetail.vue'),
          },
          {
            path: '/post', // 发展等级2
            component: () => import('../container/Post.vue'),
          },
          {
            path: '/product', // 补货，产品列表
            component: () => import('../container/Product.vue'),
          },
          {
            path: '/user', // 用户信息页面
            component: () => import('../container/User.vue'),
          },
          {
            path: '/user/change-pwd',
            component: () => import('../container/ChangePwd.vue'),
          },
          {
            path: '/user/change-avator',
            component: () => import('../container/ChangeAvator.vue'),
          },
          {
            path: '/plan/:id',
            component: () => import('../container/Plan.vue'),
          },
          {
            path: '/remain',
            component: () => import('../container/Remain.vue'),
          },
          {
            path: '/plan-list',
            component: () => import('../container/PlanList.vue'),
          },
          {
            path: '/plan-check/:id',
            component: () => import('../container/PlanCheck.vue'),
          },
          {
            path: '/my-point',
            component: () => import('../container/MyPoint.vue'),
          },
          {
            path: '/my-refund',
            component: () => import('../container/MyRefund.vue'),
          },
          {
            path: '/point-list',
            component: () => import('../container/PointList.vue'),
          },
          {
            path: '/refund-list',
            component: () => import('../container/RefundList.vue'),
          },
          {
            path: '/result-list',
            component: () => import('../container/ResultList.vue'),
          },
          {
            path: '/grouper-list',
            component: () => import('../container/GrouperList.vue'),
          },
          {
            path: '/grouper/:id',
            component: () => import('../container/Grouper.vue'),
          },
          {
            path: '/user-list',
            component: () => import('../container/UserList.vue'),
          },
          {
            path: '/user-detail/:id',
            component: () => import('../container/UserDetail.vue'),
          },
          {
            path: '/my-upgrade',
            component: () => import('../container/MyUpgrade.vue'),
          },
          {
            path: '/upgrade/:id',
            component: () => import('../container/Upgrade.vue'),
          },
          {
            path: '/upgrade-list',
            component: () => import('../container/UpgradeList.vue'),
          },
          {
            path: '/upgrade-check/:id',
            component: () => import('../container/UpgradeCheck.vue'),
          }
        ]
      },
    ]
  });
}

