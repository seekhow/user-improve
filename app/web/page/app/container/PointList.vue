<template>
  <div>
    <van-nav-bar
      title="积分产生记录"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="refund-content">
      <template v-if="list.length">
        <van-cell
          v-for="item in list"
          :key="item._id"
          :title="`${formatType(item.type)}(${item.user.username})`"
          :value="`+${item.points}分`"
          :label="formatTime(item.gmt_create)"
        />
      </template>
      <div v-else class="no-data-title">暂无数据~</div>
    </div>
  </div>
</template>
<script>
const statusMap = {
  init: '待审核',
  finish: '已完成',
  reject: '审核不通过',
}
const typeMap = {
  service: '平级推荐奖-服务人',
  topService: '平级推荐奖-上级服务人',
  monthOne: '月绩奖(1w-1.5w瓶部分)',
  monthTwo: '月绩奖(1.5w瓶以上部分)',
  storeAd: '千城万店-一次性广告补贴',
}

import dayjs from 'dayjs';

export default {
  name: 'Refund-list',
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.$http.get('/api/point/getPointList').then(res => {
        if (res && !res.error && Array.isArray(res.data)) {
          this.list = res.data;
        } else {
          this.$toast.fail('获取数据失败');
        }
      })
    },
    onClickLeft() {
      this.$router.push('/refund-list');
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    formatStatus(status) {
      return statusMap[status] || '';
    },
    formatType(type) {
      return typeMap[type] || '';
    }
  }
}
</script>
<style lang="less" scoped>
.refund-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
.record-title {
  text-align: center;
  font-size: 14px;
  color: gray;
}
.right-action {
  text-align: right;
  font-size: 11px;
  color: rgb(66, 145, 235);
  margin-right: 10px;
}
</style>
