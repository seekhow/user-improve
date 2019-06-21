<template>
  <div>
    <van-nav-bar
      title="我的积分"
      left-text="返回"
      left-arrow
      :right-text="points ? '提现' : null"
      fixed
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <div class="content">
      <van-panel title="当前积分数" desc="点击右上方提交提现申请" :status="`${points}分`">
        <div class="record-title">积分奖励记录</div>
        <div class="right-action" @click="() => this.$router.push('/my-refund')">查看提现申请记录</div>
        <van-cell
          v-for="item in list"
          :key="item._id"
          :title="formatType(item.type)"
          :value="`+${item.points}分`"
          :label="formatTime(item.gmt_create)"
        />
      </van-panel>
    </div>
  </div>
</template>
<script>
const typeMap = {
  service: '平级推荐奖-服务人',
  topService: '平级推荐奖-上级服务人',
}

import dayjs from 'dayjs';

export default {
  name: 'MyPoint',
  data() {
    return {
      points: 0,
      list: [],
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    onClickLeft() {
      this.$router.push('/');
    },
    onClickRight() {
      this.$http.post('/api/point/createRefund').then(res => {
        if (res && !res.error) {
          this.$toast('积分提现申请提交成功！');
          this.getData();
        } else {
          this.$toast('操作失败，请重试！');
        }
      })
    },
    getData() {
      this.$http.get('/api/point/getCurrent').then(res => {
        if (res && !res.error && res.data) {
          this.points = res.data.points;
          this.list = res.data.list || [];
        } else {
          this.$toast.fail('获取数据失败');
        }
      })
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    formatType(type) {
      return typeMap[type] || '';
    }
  }
}
</script>
<style lang="less" scoped>
.content {
  height: calc(100vh - 96px);
  margin-top: 46px;
  margin-bottom: 50px;
  position: relative;
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

