<template>
  <div>
    <van-nav-bar
      title="我的库存"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="content">
      <van-card
        class="card"
        key="5ce01b784f4fec230c35b556"
        :desc="item.desc"
        :thumb="item.cover || 'https://img-1258939303.cos.ap-chengdu.myqcloud.com/logo_squre.png'"
      >
        <div slot="title" class="card-title">
          {{ item.name }}
        </div>
        <div slot="thumb" style="padding: 10px;">
          <img :src="item.cover || 'https://img-1258939303.cos.ap-chengdu.myqcloud.com/logo_s.jpg'" alt="" />
        </div>
        <div slot="num">
          <span>我的库存：{{ remain || 0 }}</span>
        </div>
      </van-card>
      <div class="record-title">补货记录</div>
      <van-cell-group>
        <van-cell
          v-for="item in list"
          :key="item._id"
          :title="formatTime(item.gmt_create)"
          :value="`总价：${item.currentTotal}`"
          :label="formatStatus(item.status)"
          is-link
          @click="onItemClick(item._id)"
        />
      </van-cell-group>
    </div>
  </div>
</template>
<script>
const statusMap = {
  init: '待提交付款凭证',
  paid: '已提交付款凭证待审核',
  finish: '已完成',
  reject: '审核未通过',
}

import dayjs from 'dayjs';
export default {
  name: 'Remain',
  data() {
    return {
      item: {}, // 
      remain: 0,
      list: [],
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    onClickLeft() {
      this.$router.push('/');
    },
    getData() {
      this.$http.get('/api/product/remain').then(res => {
        if (res && !res.error && res.data) {
          this.item = res.data.product;
          this.remain = res.data.remain;
          this.list = res.data.list;
        } else {
          this.$toast.fail('获取数据失败');
        }
      });
    },
    formatTime(str) {
      if (!str) {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      }
      return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
    },
    formatStatus(str) {
      if (!str) return '未知状态';
      return statusMap[str];
    },
    onItemClick(id) {
      this.$router.push(`/plan/${id}`);
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
.card {
  font-size: 14px;
  .card-title {
    font-size: 16px;
    margin-top: 1px;
  }
}
.record-title {
  text-align: center;
  font-size: 13px;
  color: gray;
}
</style>
