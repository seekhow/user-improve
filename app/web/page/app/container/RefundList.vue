<template>
  <div>
    <van-nav-bar
      title="提现申请记录"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="refund-content">
      <div class="right-action" @click="() => this.$router.push('/point-list')">查看所有积分产生记录</div>
      <template v-if="list.length">
        <van-cell
          v-for="item in list"
          :key="item._id"
          :title="`${item.user.username}(${formatLevel(item.user.level, item.user.isUnion)})`"
          :value="`${item.points}分(${formatStatus(item.status)})`"
          :label="formatTime(item.gmt_create)"
          :is-link="item.status === 'init'"
          @click="onItemClick(item._id, item.status)"
        />
      </template>
      <div v-else class="no-data-title">暂无数据~</div>
    </div>
    <van-actionsheet
      v-model="show"
      :actions="actions"
      cancel-text="取消"
      @select="onSelect"
      @cancel="onCancel"
    />
  </div>
</template>
<script>
const statusMap = {
  init: '待审核',
  finish: '已完成',
  reject: '审核不通过',
}
const memberMap = {
  vip: '等级1',
  agent: '等级2',
  toper: '等级3',
  union: '特殊用户',
}

import dayjs from 'dayjs';

export default {
  name: 'Refund-list',
  data() {
    return {
      list: [],
      show: false,
      currentId: -1,
      actions: [
        { name: '同意提现', key: 'agreeRefund' }, { name: '回绝请求', key: 'rejectRefund' }
      ]
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    onSelect(item) {
      const { key } = item;
      this[key]();
    },
    onCancel() {},
    onItemClick(id, status) {
      if (status !== 'init') return;
      this.currentId = id;
      this.show = true;
    },
    agreeRefund() {
      const { currentId } = this;
      if (!currentId || currentId < 0) return;
      this.$http.post(`/api/point/agreeRefund/${currentId}`).then(res => {
        this.show = false;
        if (res && !res.error) {
          this.$toast('操作成功：同意提现！');
          this.getList();
        } else {
          this.$toast.fail('操作失败！');
        }
      })
    },
    rejectRefund() {
      const { currentId } = this;
      if (!currentId || currentId < 0) return;
      this.$http.post(`/api/point/rejectRefund/${currentId}`).then(res => {
        this.show = false;
        if (res && !res.error) {
          this.$toast('操作成功：回绝请求！');
          this.getList();
        } else {
          this.$toast.fail('操作失败！');
        }
      })
    },
    getList() {
      this.$http.get('/api/point/getRefundList').then(res => {
        if (res && !res.error && Array.isArray(res.data)) {
          this.list = res.data;
        } else {
          this.$toast.fail('获取数据失败');
        }
      })
    },
    onClickLeft() {
      this.$router.push('/');
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
    formatLevel(str, isUnion) {
      if (isUnion) return '特殊用户';
      return memberMap[str] || '';
    },
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
