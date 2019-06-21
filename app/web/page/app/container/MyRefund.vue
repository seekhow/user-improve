<template>
  <div>
    <van-nav-bar
      title="积分提现申请"
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
          :title="`提现积分：${item.points}`"
          :value="formatStatus(item.status)"
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

import dayjs from 'dayjs';

export default {
  name: 'My-Refund',
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
      this.$http.get('/api/point/getCurrentRefund').then(res => {
        console.log(res);
        if (res && !res.error && Array.isArray(res.data)) {
          this.list = res.data;
        } else {
          this.$toast.fail('获取数据失败');
        }
      })
    },
    onClickLeft() {
      this.$router.push('/my-point');
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    formatStatus(status) {
      return statusMap[status] || '';
    }
  }
}
</script>
<style lang="less" scoped>
.refund-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
</style>
