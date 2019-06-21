<template>
  <div class="page">
    <van-nav-bar
      title="申请人详情"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="refund-content" v-if="info">
      <van-cell-group>
        <van-cell title="编号" :value="info._id" />
        <van-cell title="姓名" :value="info.username" />
        <van-cell title="电话" :value="info.phone" />
        <van-cell title="身份证号" :value="info.IDCard" />
        <van-cell title="申请时间" :value="formatTime(info.gmt_create)" />
      </van-cell-group>
      <van-cell-group style="margin-top: 10px;">
        <van-cell title="所在区域" :value="getCurrentRegion" />
        <van-cell title="详细地址" :value="info.addressDetail" />
      </van-cell-group>
      <van-cell-group style="margin-top: 10px;">
        <van-cell title="推荐人" :value="info.leader && info.leader.username" />
        <van-cell title="申请等级" :value="formatLevel(info.level, info.isUnion)" />
      </van-cell-group>
      <van-cell-group style="margin-top: 10px;">
        <van-switch-cell
          v-model="info.isStore"
          title="是否认证为店铺"
          disabled
          label="如果选择了请检查店铺相关照片"
        />
      </van-cell-group>
      <van-cell-group style="margin-top: 10px;">
        <van-cell title="支付凭证截图" v-if="info.evidence">
          <div slot="label" class="cell-desc-wrapper" >
            <div
              v-for="(item, index) in info.evidence"
              :key="item.key"
              @click="onImageClick(index)"
              class="img-wrapper"
            >
              <img :src="item.url" :alt="item.key">
            </div>
          </div>
        </van-cell>
      </van-cell-group>
      <van-cell-group v-if="info && info.status === 'init'">
        <van-button style="margin: 10px;width: calc(100vw - 20px)" type="primary" size="large" @click="agree">通过申请</van-button>
        <van-button style="margin: 0 10px 10px 10px;width: calc(100vw - 20px)" size="large" type="danger" @click="refuse">拒绝申请</van-button>
      </van-cell-group>
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
import { ImagePreview } from 'vant';

export default {
  name: 'CheckDetail',
  data() {
    return {
      info: {},
    }
  },
  computed: {
    getCurrentRegion() {
      const { info } = this;
      if (info && info.addressRegion && Array.isArray(info.addressRegion) && info.addressRegion.length) {
        return info.addressRegion.reduce((total, current) => total + current.name, '');
      }
      return '';
    }
  },
  mounted() {
    const { id } = this.$route.params;
    if (!id) this.$router.push('/check');
    this.$http.get(`/api/check/${id}`).then(res => {
      console.log(res);
      if (res && !res.error && res.data) {
        this.info = res.data;
      } else {
        this.$toast.fail('获取失败！');
      }
    });
  },
  methods: {
    onClickLeft() {
      this.$router.push('/check');
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
    onImageClick(index) {
      const { info = {} } = this;
      const { evidence: list } = info;
      if (!list || !Array.isArray(list) || !list.length) return;
      const urls = list.map(x => x.url);
      ImagePreview({
        images: urls,
        startPosition: index,
      });
    },
    agree() {
      const { _id } = this.info;
      if (!_id) return;
      this.$http.post(`/api/check/agree`, { id: _id }).then(res => {
        console.log(res);
        if (res && !res.error) {
          this.$toast('操作成功！');
          this.$router.push('/check');
        } else {
          this.$toast.fail('操作失败！');
        }
      });
    },
    refuse() {
      const { _id } = this.info;
      if (!_id) return;
      this.$http.post(`/api/check/refuse`, { id: _id }).then(res => {
        console.log(res);
        if (res && !res.error) {
          this.$toast('操作成功！');
          this.$router.push('/check');
        } else {
          this.$toast.fail('操作失败！');
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  height: calc(100vh - 50px);
  background: #f9f5f5;
}
.refund-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
.cell-desc-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}
.img-wrapper {
  width: 70px;
  height: 70px;
  margin: 5px;
  margin-top: 0;
  img {
    width: 70px;
    height: 70px;
  }
}
.btn-group {
  margin: 10px 0;
  padding: 10px 20px;
}
</style>
