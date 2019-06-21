<template>
  <div>
    <router-view class="container" :user="user" />
    <van-tabbar v-if="!hiddenBar" class="bar" v-model="active" @change="onTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="friends-o">用户信息</van-tabbar-item>
      <!-- <van-tabbar-item icon="setting-o">审核</van-tabbar-item> -->
    </van-tabbar>
  </div>
</template>
<script>
const tabs = [
  { key: 0, name: '首页', url: '/' },
  { key: 1, name: '用户信息', url: '/user' },
];

export default {
  name: 'Container',
  data() {
    return {
      active: 0,
    }
  },
  preFetch ({ state, dispatch, commit }) {
    return Promise.all([
      dispatch('getUserData'),
    ])
  },
  beforeMount() {
    return Promise.all([
      this.$store.dispatch('getUserData', this.$router),
    ])
  },
  computed: {
    hiddenBar() {
      return this.$route.meta.hiddenBar;
    },
    isAdmin() {
      const { role = 'normal' } = this.user;
      if (['admin', 'super'].includes(role)) {
        return true;
      }
      return false;
    },
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    onTabChange(current) {
      const item = tabs.find(x => x.key === current) || {};
      const url = item.url || '/';
      this.$router.push(url);
    }
  },
  watch: {
    "$route.path": function(val) {
      const index = tabs.findIndex(x => {
        if (x === '/user' && val.includes('/user')) {
          return true;
        }
        return val === x.url
      });
      if (index >= 0) {
        this.active = index;
      } else {
        this.active = -1;
      }
    }
  }
}
</script>
<style lang="less">
.van-tabbar-item--active {
  color: #fe725b;
}
</style>
