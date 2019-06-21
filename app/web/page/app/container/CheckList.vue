<template>
  <div>
    <van-nav-bar
      :title="getTitle"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="refund-content">
      <van-cell
        v-for="item in list"
        :key="item._id"
        :title="item.username"
        :value="`申请等级：${formatLevel(item.level, item.isUnion)}`"
        :label="formatTime(item.gmt_create)"
        is-link
        @click="onItemClick(item._id)"
      />
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
  name: 'Refund',
  data() {
    return {
      list: [],
    }
  },
  computed: {
    getTitle() {
      const { list } = this;
      return list.length ? `审核资质 - 共${list.length}个申请` : '审核资质';
    }
  },
  mounted() {
    this.$http.get('/api/check/list?status=paid').then(res => {
      console.log(res);
      if (res && !res.error && Array.isArray(res.data)) {
        this.list = res.data;
      } else {
        this.$toast.fail('获取失败！');
      }
    });
  },
  methods: {
    onClickLeft() {
      this.$router.push('/');
    },
    onItemClick(id) {
      if (!id) return;
      this.$router.push(`/check-detail/${id}`);
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
</style>
