<template>
  <div class="home-content">
    <div class="loading" v-if="loading">
      <span>页面加载中,请稍等...</span>
    </div>
    <div v-else>
      <div class="home-header">
        <img @click="onAvatorClick" v-if="user.avator" class="home-profile" :src="user.avator || '../../../asset/images/avator.jpg'" />
        <div @click="onAvatorClick" v-else class="poster-card-avator">{{ user.username && user.username[0] || '' }}</div>
        <div class="home-user-line">
          <div class="home-line home-btw">
            <span>{{ user.username || '' }}</span>
            <span style="margin-left: 10px;">{{ `${getShowTel(user.phone)}(id: ${user.user_id})` }}</span>
          </div>
          <div class="home-line home-btw">
            <div>{{ getCurrentLevel }}</div>
            <div style="margin-left: 12px;">
              所属上级：{{ `${getCurrentLeader}` }}
            </div>
          </div>
        </div>
      </div>
      <div class="home-top-toolbar">
        <van-row>
          <van-col span="8">
            <div class="home-card" @click="goTo('/remain')">
              <div class="home-card-label">{{ homeData.userData || 0 }}盒</div>
              <!-- <van-icon size="28px" color="#fe725b" name="gift-o" /> -->
              <div class="home-card-name">个人业绩</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="home-card" @click="goTo('/result-list')">
              <div class="home-card-label">{{ homeData.groupData || 0 }}盒</div>
              <div class="home-card-name">团队业绩</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="home-card" @click="goTo('/grouper-list')">
              <div class="home-card-label">{{ homeData.grouperData || 0 }}人</div>
              <div class="home-card-name">已推荐</div>
            </div>
          </van-col>
        </van-row>
      </div>
      <div class="home-box-toolbar">
        <van-row v-for="(row, rowIndex) in menuMap" :key="rowIndex">
          <van-col span="8" v-for="(line, lineIndex) in row" :key="`row-${rowIndex}-${lineIndex}`">
            <div class="home-card" @click="line.url ? goTo(line.url) : null">
              <van-icon size="28px" :name="line.icon || 'close'" :color="line.color" />
              <div class="home-card-name">{{ line.name }}</div>
            </div>
          </van-col>
        </van-row>
      </div>
      <div v-if="user.role !== 'normal'" class="home-box-toolbar" style="margin-top: 10px;">
        <div style="font-size: 11px; padding: 5px 0 5px 10px;">管理员菜单</div>
        <van-row v-for="(row, rowIndex) in adminMenuMap" :key="rowIndex">
          <van-col span="8" v-for="(line, lineIndex) in row" :key="`row-${rowIndex}-${lineIndex}`">
            <div class="home-card" @click="line.url ? goTo(line.url) : null">
              <van-icon size="28px" :name="line.icon || 'close'" :color="line.color" />
              <div class="home-card-name">{{ line.name }}</div>
            </div>
          </van-col>
        </van-row>
      </div>
    </div>
  </div>
</template>
<script>
const menuMap = [
  [
    { name: '我的积分', color: '#0093ee', icon: 'points', url: '/my-point' },
    { name: '发展用户', color: '#66CC00', icon: 'manager-o', url: '/post' },
    { name: '我要升级', color: '#FF33CC', icon: 'upgrade', url: '/my-upgrade' },
  ],
  [
    { name: '我的库存', color: '#CC0033', icon: 'cart-o', url: '/remain' },
    { name: '我要补货', color: '#66CC00', icon: 'add-o', url: '/product' },
    // { name: '我要发货', color: '', icon: 'logistics' },
  ],
];

const adminMenuMap = [
  [
    { name: '积分管理', color: '#34EBEC', icon: 'coupon-o', url: '/refund-list' },
    { name: '审核补货', color: '#C9CC21', icon: 'service-o', url: '/plan-list' },
    { name: '审核资质', color: '#CC00FF', icon: 'passed', url: '/check' },
  ],
  [
    { name: '所有用户', color: '#FF6666', icon: 'friends-o', url: '/user-list' },
    { name: '升级审核', color: '#99CCFF', icon: 'send-gift-o', url: '/upgrade-list' },
  ]
];

const columns =[
  { key: 'vip', text: '等级1' },
  { key: 'agent', text: '等级2' },
  { key: 'toper', text: '等级3' },
  { key: 'union', text: '特殊用户' },
];

export default {
  name: 'Main',
  props: {
    user: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      menuMap,
      adminMenuMap,
      loading: true,
      homeData: {},
    };
  },
  mounted() {
    this.loading = false;
    this.getHomeData();
  },
  computed: {
    getCurrentLevel() {
      const { user } = this;
      if (user && user.level) {
        if (user._id == '5cef9d6ecf1dec0648685e83') return '发起者';
        if (user.isUnion) return '特殊用户';
        const item = columns.find(x => x.key === user.level) || {};
        return item.text || '';
      }
      return '';
    },
    getCurrentLeader() {
      const { user } = this;
      if (user && user.leader && user.leader.phone) {
        return this.getShowTel(user.leader.phone);
      }
      return '';
    }
  },
  methods: {
    onAvatorClick() {
      this.$router.push('/user/change-avator');
    },
    getHomeData() {
      this.$http.get('/api/user/getHomeData').then(res => {
        if (res && !res.error && res.data) {
          this.homeData = res.data;
        } else {
          this.$toast.fail('获取业绩数据失败！');
        }
      })
    },
    getShowTel(phone) {
      if (!phone || phone.length !== 11) return phone;
      const start = phone.substr(0, 3);
      const end = phone.substr(-4, 4);
      return start + '****' + end;
    },
    goTo(url) {
      console.log(url);
      this.$router.push(url);
    }
  }
}
</script>
<style lang="less">
.home-content {
  background: #f2f2f2;
  color: #666;
  min-height: calc(100vh - 50px);
  width: 100vw;
  margin-bottom: 50px;
  padding-bottom: 10px;
}
.home-header {
  height: auto;
  width: 100vw;
  padding-top: 20px;
  padding-bottom: 50px;
  background: linear-gradient(#fe725b, #f93a36);
  overflow: hidden;
  display: flex;
  align-items: center;
  .home-profile {
    width: 60px;
    height: 60px;
    border-radius: 60px;
    margin-left: 20px;
    margin-top: 15px;
  }
  .poster-card-avator {
    width: 60px;
    height: 60px;
    background-color: #f38c7c;
    color: #fff;
    font-size: 20px;
    border-radius: 60px;
    margin-left: 20px;
    margin-top: 15px;
    text-align: center;
    line-height: 60px;
  }
  .home-user-line {
    margin-left: 15px;
    flex: 1;
    .home-line {
      width: auto;
      display: flex;
      color: #fff;
      font-size: 16px;
      align-items: center;
    }
    .home-center {
      justify-content: center;
    }
    .home-btw {
      margin-top: 20px;
    }
  }
}
.home-top-toolbar {
  width: calc(100vw - 40px);
  margin: -20px 20px 20px 20px;
  height: 100px;
  box-shadow: 0 2px 4px #e8e8e8;
  overflow: hidden;
  background: #fff;
  border-radius: 5px;
  font-size: 14px;
  color: #000;
  .home-card {
    width: 100%;
    height: 110px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .home-card-name {
      margin-top: 10px;
    }
    .home-card-label {
      font-size: 18px;
      color: #fe725b;
    }
  }
}
.home-box-toolbar {
  width: calc(100vw - 40px);
  margin: 20px;
  background: #fff;
  // height: 100px;
  border-radius: 5px;
  font-size: 14px;
  color: #000;
  .home-card {
    width: 100%;
    height: 110px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .home-card-name {
      margin-top: 10px;
    }
  }
}

</style>
<style lang="less">
.van-row {
  &:not(:first-child) {
    border-top: 1px #f9f4f4 solid;
  }
  .van-col--8 {
    &:not(:first-child) {
      border-left: 1px #f9f4f4 solid;
    }
  }
}

</style>
