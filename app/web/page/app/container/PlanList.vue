<template>
  <div>
    <van-nav-bar
      title="审核补货"
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
          :title="item.user.username"
          :value="`总额：${item.currentTotal}(${formatStatus(item.status)})`"
          :label="formatTime(item.gmt_create)"
          is-link
          @click="onItemClick(item._id)"
        />
      </template>
      <div v-else class="no-data-title">暂无数据~</div>
    </div>
  </div>
</template>
<script>
const statusMap = {
  init: '待付款',
  paid: '待审核',
  finish: '已完成',
  reject: '未通过',
}

import dayjs from 'dayjs';

export default {
  name: 'PlanList',
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    formatStatus(status) {
      return statusMap[status] || '';
    },
    onClickLeft() {
      this.$router.push('/');
    },
    getList() {
      this.$http.get('/api/plan/getList').then(res => {
        if (res && !res.error && Array.isArray(res.data)) {
          console.log(res.data);
          this.list = res.data;
        } else {
          this.$toast('获取数据失败！');
        }
      })
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    onItemClick(id) {
      this.$router.push(`/plan-check/${id}`);
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
