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
      <van-cell title="支付凭证" required>
        <div slot="label" class="cell-desc-wrapper" >
          <div
            v-for="(item, index) in data.evidence"
            :key="index"
            @click="onImageClick(index)"
            class="img-wrapper"
          >
            <img :src="item.url" :alt="item.key">
          </div>
        </div>
      </van-cell>
      <van-button
        v-if="data.status === 'paid'"
        @click="rejectPlan"
        style="margin: 10px;width: calc(100vw - 20px)"
        size="large"
        type="danger"
      >
        审核不通过
      </van-button>
      <van-button
        v-if="data.status === 'paid'"
        @click="agreePlan"
        style="margin: 0 10px;width: calc(100vw - 20px)"
        size="large"
        type="primary"
      >
        审核通过
      </van-button>
    </div>
  </div>
</template>
<script>
const columns =[
  { key: 'vip', text: '等级1' },
  { key: 'agent', text: '等级2' },
  { key: 'toper', text: '等级3' },
  { key: 'union', text: '特殊用户' },
];
const memberMap = {
  vip: '等级1',
  agent: '等级2',
  toper: '等级3',
  union: '特殊用户',
}

const statusMap = {
  init: '待提交付款凭证',
  paid: '已提交付款凭证待审核',
  finish: '已完成',
  reject: '审核未通过',
}
import { ImagePreview } from 'vant';
import ImgUploader from '../router/ImgUploader';
import { mapMutations } from 'vuex';
import dayjs from 'dayjs';
export default {
  name: 'PlanCheck',
  data() {
    return {
      data: {},
      item: {},
      user: {},
      imgList: [],
    };
  },
  components: {
    ImgUploader,
  },
  computed: {
    getCurrentLevel() {
      const { user } = this;
      if (user && user.level) {
        const item = columns.find(x => x.key === user.level);
        return item.text;
      }
      return '';
    },
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
          console.log(res.data);
          this.data = res.data;
        } else {
          this.$toast('无法获取对应id的升级计划数据');
          this.$router.push('/upgrade-list');
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
    onImageClick(index) {
      const urls = this.data.evidence.map(x => x.url);
      ImagePreview({
        images: urls,
        startPosition: index,
      });
    },
    agreePlan() {
      const { _id } = this.data;
      if (!_id) return;
      this.$http.post(`/api/upgrade/agree/${_id}`).then(res => {
        if (res && !res.error) {
          const { id } = this.$route.params;
          this.getData(id);
          this.$toast('操作成功：审核通过！');
        } else {
          this.$toast.fail('操作失败');
        }
      });
    },
    rejectPlan() {
      const { _id } = this.data;
      if (!_id) return;
      this.$http.post(`/api/upgrade/reject/${_id}`).then(res => {
        if (res && !res.error) {
          const { id } = this.$route.params;
          this.getData(id);
          this.$toast('操作成功：审核不通过！');
        } else {
          this.$toast.fail('操作失败');
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
.img-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  margin: 5px;
  margin-top: 0;
  .img-delete {
    position: absolute;
    top: 0;
    right: 0;
  }
  img {
    width: 70px;
    height: 70px;
  }
}
.cell-desc-wrapper {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
}
</style>
