<template>
  <div>
    <van-nav-bar
      title="成员信息"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="grouper-content">
      <div class="grouper-user-card">
        <div class="avator">{{ getAvator }}</div>
        <!-- <div class="user-name">{{ getCurrentUser }}</div>
        <div class="user-level">{{ getMemberName }}</div> -->
      </div>
      <div class="grouper-rows">
        <van-cell title="姓名" :value="getCurrentUser" />
        <van-cell title="等级" :value="getMemberName" />
        <van-cell title="手机号" :value="currentUser.phone" />
        <van-cell title="加入时间" :value="formatTime(currentUser.gmt_create)" />
        <van-cell title="当前积分" :value="currentUser.points" />
        <van-cell title="当前库存" :value="currentUser.remain" />
        <van-cell title="是否认证店铺" :value="currentUser.isStore ? '是' : '否'" />
        <van-cell title="地址" :label="getCurrentRegion(currentUser.addressRegion, currentUser.addressDetail)" />
      </div>
      <div class="record-title" style="margin-top: 20px;">下面是详细记录</div>
      <div>
        <van-collapse v-model="activeCol" accordion>
          <van-collapse-item title="补货记录" name="plan">
            <template v-if="planList.length">
              <van-cell
                v-for="item in planList"
                :key="item._id"
                :title="`${item.content}瓶`"
                :value="`${item.currentTotal}元`"
                :label="formatTime(item.gmt_create)"
              />
            </template>
            <div v-else class="no-data-title">暂无数据~</div>
          </van-collapse-item>
          <van-collapse-item title="积分记录" name="point">
            <template v-if="pointList.length">
              <van-cell
                v-for="item in pointList"
                :key="item._id"
                :title="formatType(item.type)"
                :value="`+${item.points}分`"
                :label="formatTime(item.gmt_create)"
              />
            </template>
            <div v-else class="no-data-title">暂无数据~</div>
          </van-collapse-item>
          <van-collapse-item title="提现记录" name="refund">
            <template v-if="refundList.length">
              <van-cell
                v-for="item in refundList"
                :key="item._id"
                :title="`提现积分：${item.points}`"
                :value="formatStatus(item.status)"
                :label="formatTime(item.gmt_create)"
              />
            </template>
            <div v-else class="no-data-title">暂无数据~</div>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import { NavBar, List, Cell } from 'vant';
import dayjs from 'dayjs';

const memberMap = {
  vip: '等级1',
  agent: '等级2',
  toper: '等级3',
  union: '特殊用户',
}

const typeMap = {
  service: '平级推荐奖-服务人',
  topService: '平级推荐奖-上级服务人',
  monthOne: '月绩奖(1w-1.5w瓶部分)',
  monthTwo: '月绩奖(1.5w瓶以上部分)',
  storeAd: '千城万店-一次性广告补贴',
}

const statusMap = {
  init: '待审核',
  finish: '已完成',
  reject: '审核不通过',
}

export default {
  name: 'UserDetail',
  components: {
    [NavBar.name]: NavBar,
    [List.name]: List,
    [Cell.name]: Cell
  },
  data() {
    return {
      planList: [],
      pointList: [],
      refundList: [],
      currentUser: {},
      activeCol: ''
    }
  },
  computed: {
    getCurrentUser() {
      return this.currentUser.username || '';
    },
    getAvator() {
      const { username = '' } = this.currentUser;
      return username[0] || '';
    },
    getMemberName() {
      const { currentUser } = this;
      if (currentUser.isUnion) return '特殊用户';
      return memberMap[currentUser.level] || '';
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList(pageNum = 0) {
      const { id } = this.$route.params;
      if (!id) return;
      this.$http.get(`/api/user/getUserDetail/${id}`).then(res => {
        console.log(res);
        if (res && !res.error && res.user && res.planList && res.pointList && res.refundList) {
          this.planList = res.planList;
          this.pointList = res.pointList;
          this.refundList = res.refundList;
          this.currentUser = res.user;
        } else {
          this.$toast.fail('数据获取失败！');
        }
      });
    },
    onClickLeft() {
      this.$router.push('/user-list');
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    formatType(type) {
      return typeMap[type] || '';
    },
    formatStatus(status) {
      return statusMap[status] || '';
    },
    getCurrentRegion(addressRegion, detail) {
      const { info } = this;
      if (addressRegion && Array.isArray(addressRegion) && addressRegion.length) {
        return addressRegion.reduce((total, current) => total + current.name, '') + detail;
      }
      return '';
    }
  }
}
</script>
<style lang="less" scoped>
.grouper-content {
  margin-top: 46px;
  margin-bottom: 50px;
  .grouper-rows {
    font-size: 14px;
    span {
      color: gray;
    }
  }
  .grouper-user-card {
    width: 100%;
    height: 85px;
    display: flex;
    padding-top: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: transparent;
    position: relative;
    .avator {
      width: 72px;
      height: 72px;
      border-radius: 72px;
      text-align: center;
      line-height: 72px;
      background-color: #fe725b;
      color: #fff;
      font-size: 25px;
      font-weight: 700;
    }
    .user-name {
      position: absolute;
      bottom: 35px;
      color: #435364;
      font-size: 17px;
      font-weight: 600;
    }
    .user-level {
      position: absolute;
      bottom: 50px;
      color: #435364;
      font-size: 15px;
    }
  }
  .item {
    .item-value {
      flex: 0.4;
      color: #fe725b;
      .value-user {
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
    }
  }
  .record-title {
    text-align: center;
    font-size: 14px;
    color: gray;
  }
}
</style>
