<template>
  <div>
    <van-nav-bar
      title="团队业绩"
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
          :title="`${item.user.username}(${formatLevel(item.user.level, item.user.isUnion)})`"
          :value="`${item.currentTotal}元(${item.content}瓶)`"
          :label="formatTime(item.gmt_create)"
        />
      </template>
      <div v-else class="no-data-title">暂无数据~</div>
    </div>
  </div>
</template>
<script>
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
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.$http.get('/api/user/getGroupRes').then(res => {
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
