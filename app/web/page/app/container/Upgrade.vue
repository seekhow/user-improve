<template>
  <div>
    <van-nav-bar
      title="升级计划详情"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="content">
      <van-cell-group>
         <van-cell title="提交时间" :value="formatTime(data.gmt_create)" />
         <van-cell title="申请人" :value="data.user && data.user.username" />
         <van-cell title="原等级" :value="formatLevel(data.source_level)" />
         <van-cell title="申请等级" :value="formatLevel(data.target_level)" />
         <van-cell title="升级计划状态" :value="formatStatus(data.status)" />
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
  finish: '已完成',
  paid: '已提交付款凭证待审核',
  reject: '审核未通过',
}
const memberMap = {
  vip: '等级1',
  agent: '等级2',
  toper: '等级3',
  union: '特殊用户',
}

import ImgUploader from '../router/ImgUploader';
import { mapMutations } from 'vuex';
import dayjs from 'dayjs';
export default {
  name: 'Upgrade',
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
      this.$http.get(`/api/upgrade/getOne/${id}`).then(res => {
        this.changeLoading(false);
        if (res && !res.error && res.data) {
          this.data = res.data;
        } else {
          this.$toast('无法获取对应id的升级计划数据');
          this.$router.push('/my-upgrade');
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
    formatLevel(level) {
      return memberMap[level] || '';
    },
    onImgChange(arr) {
      this.imgList = arr;
    },
    submitImg() {
      if (!this.imgList.length) return;
      const { _id } = this.data;
      if (!_id) return;
      this.$http.post(`/api/upgrade/updateEvi/${_id}`, { evidence: this.imgList }).then(res => {
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
      this.$http.post(`/api/upgrade/remove/${_id}`).then(res => {
        if (res && !res.error) {
          this.$toast('操作成功：取消计划！');
          this.$router.push('/');
        } else {
          this.$toast.fail(res.message || '提交失败');
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
