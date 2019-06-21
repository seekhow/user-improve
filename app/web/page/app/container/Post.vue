<template>
  <div>
    <div class="post-page">
      <div id="img-content" class="img-content">
        <img v-if="imgUrl" :src="imgUrl" class="top-image" alt="">
        <template >
          <img @load="test" id="back-img" src="../../../asset/images/avator.jpg" alt="">
          <div class="username">{{ user.username }}</div>
          <div class="img-level">{{ getMemberName }}</div>
          <div class="datetime">{{ getCurrentTime }}</div>
          <div class="phone">{{ getCurrentPhone }}</div>
          <div class="qr-container">
            <qrcode-vue v-if="value" :value="value" :size="size" level="L" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import QrcodeVue from 'qrcode.vue';
import dayjs from 'dayjs';
import { mapMutations } from 'vuex';

export default {
  name: 'Post',
  components: {
    QrcodeVue,
  },
  props: {
    user: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      value: '',
      size: 70,
      show: false,
      columns: [
        { key: 'vip', text: '等级1' },
        { key: 'agent', text: '等级2' },
        { key: 'toper', text: '等级3' },
        { key: 'union', text: '特殊用户' },
      ],
      currentLevel: 'vip',
      imgUrl: '',
    }
  },
  computed: {
    getMemberName() {
      const { user, columns } = this;
      if (user && user.level) {
        if (user._id == '5cef9d6ecf1dec0648685e83') return '发起者';
        if (user.isUnion) return '特殊用户';
        const item = columns.find(x => x.key === user.level) || {};
        return item.text;
      }
      return '';
    },
    getCurrentLevelName() {
      const obj = this.columns.find(x => x.key === this.currentLevel) || {};
      return obj.text || '未知身份';
    },
    getCurrentTime() {
      const { user } = this;
      if (user && user.gmt_create) {
        return dayjs(user.gmt_create).format('YYYY-MM-DD');
      }
      return dayjs().format('YYYY-MM-DD');
    },
    getCurrentPhone() {
      return this.user.IDCard || this.user.phone;
    }
  },
  mounted() {
    const user = this.user || {};
    const { username = '', _id } = user;
    if (!_id) {
      return this.$router.push('/');
    }
    const time = dayjs().valueOf();
    const level = 'vip';
    const origin = window.origin;
    const val = `${origin}/share?createTime=${time}&user_id=${_id}&user_name=${username}`;
    const newVal = encodeURI(val);
    console.log(newVal); // eslint-disable-line
    this.value = newVal;
    this.changeLoading(true);
  },
  methods: {
    ...mapMutations(['changeLoading']),
    test() {
      if (this.imgUrl) return null;
      console.log(1);
      const html2canvas = require('html2canvas');
      const dom = document.getElementById('img-content');
      html2canvas(dom, {
        useCORS: true,
      }).then((canvas) => {
        const imgUri = canvas.toDataURL();
        this.imgUrl = imgUri;
        this.changeLoading(false);
      });
    },
  }
}
</script>
<style lang="less" scoped>
.post-page {
  height: calc(100vh - 50px);
  background-color: thistle;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
  position: relative;
  .btn {
    position: absolute;
    bottom: 10px;
    left: 10px;
  }
  .img-content {
    width: 100vw;
    position: relative;
    z-index: 10;
    .top-image {
      position: absolute;
      z-index: 20;
      width: 100%;
      top: 0;
      left: 0;
    }
    img {
      width: 100%;
    }
    .datetime {
      position: absolute;
      left: 35%;
      top: 64%;
      // color: red;
    }
    .phone {
      position: absolute;
      // color: red;
      left: 57%;
      top: 37%;
      font-weight: 600;
      font-size: 10px;
    }
    .qr-container {
      position: absolute;
      top: 74%;
      left: 20%;
      img {
        position: absolute;
        top: calc(50% - 8px);
        left: calc(50% - 8px);
        width: 16px;
        height: 16px;
        border-radius: 5px;
      }
    }
    .username {
      position: absolute;
      top: 36%;
      left: 35%;
      // color: red;
      font-size: 14px;
      font-weight: 600;
    }
    .img-level {
      position: absolute;
      top: 40%;
      left: 56%;
      // color: red;
      font-size: 11px;
      font-weight: 600;
    }
  }
  .post-content {
    background-color: #fff;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
    padding-bottom: 20px;
    padding-top: 30px;
    .post-header {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
    .post-footer {
      display: flex;
      align-items: center;
      img {
        width: 80px;
        height: 70px;
        margin-bottom: -10px;
        margin-left: -10px;
      }
      .post-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 10px;
        .line {
          margin-top: 8px;
          color: gray;
          font-size: 16px;
          span {
            color: red;
            font-size: 18px;
            margin: 0 4px;
          }
        .desc {
          margin-top: 10px;
          color: #f76666;
          font-size: 15px;
        }
        .user-name {
          margin-top: 10px;
          color: #f76666;
          font-size: 16px;
        }
      }
      }
    }
  }
}
</style>
