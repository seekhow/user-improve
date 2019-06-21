<template>
  <div>
    <van-nav-bar
      title="补货详情"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="content">
      <van-cell-group>
         <van-cell title="补货时间" :value="formatTime(data.gmt_create)" />
         <van-cell title="补货产品" :value="item.name" />
         <van-cell title="补货数量" :value="`${data.content}盒`" />
         <van-cell title="补货单价" :value="`${data.currentPrice}元/盒`" />
         <van-cell title="补货计划状态" :value="formatStatus(data.status)" />
      </van-cell-group>
      <ImgUploader
        v-if="data.status === 'init'"
        title="请上传支付凭证截图"
        :onChange="onImgChange"
      />
      <van-button
        v-if="data.status === 'init'"
        @click="submitImg"
        style="margin: 10px;width: calc(100vw - 20px)"
        size="large"
        type="info"
      >
        提交凭证
      </van-button>
      <van-button
        v-if="data.status === 'init'"
        @click="cancelPlan"
        style="margin: 0 10px;width: calc(100vw - 20px)"
        size="large"
        type="danger"
      >
        取消计划
      </van-button>
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
import ImgUploader from '../router/ImgUploader';
import { mapMutations } from 'vuex';
import dayjs from 'dayjs';
export default {
  name: 'Plan',
  data() {
    return {
      data: {},
      item: {},
      imgList: [],
    };
  },
  components: {
    ImgUploader,
  },
  mounted() {
    const { id } = this.$route.params;
    this.getData(id);
  },
  methods: {
    ...mapMutations(['changeLoading']),
    onClickLeft() {
      this.$router.back();
    },
    getData(id) {
      if (!id) return;
      this.changeLoading(true);
      this.$http.get(`/api/plan/getOne/${id}`).then(res => {
        this.changeLoading(false);
        if (res && !res.error && res.data) {
          console.log(res.data);
          this.data = res.data;
          this.item = res.data.product;
        } else {
          this.$toast('无法获取对应id的补货计划数据');
          this.$router.push('/remain');
        }
      }).catch(() => this.changeLoading(false));
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
    onImgChange(arr) {
      this.imgList = arr;
    },
    submitImg() {
      if (!this.imgList.length) return;
      const { _id } = this.data;
      if (!_id) return;
      this.$http.post(`/api/plan/updateEvi/${_id}`, { evidence: this.imgList }).then(res => {
        if (res && !res.error) {
          this.$toast('提交成功，请等待审核');
          const { id } = this.$route.params;
          this.getData(id);
        } else {
          this.$toast.fail('提交失败');
        }
      })
    },
    cancelPlan() {
      const { _id } = this.data;
      if (!_id) return;
      this.$http.post(`/api/plan/remove/${_id}`).then(res => {
        if (res && !res.error) {
          this.$toast('操作成功：取消计划！');
          this.$router.push('/');
        } else {
          this.$toast.fail('提交失败');
        }
      });
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
</style>
