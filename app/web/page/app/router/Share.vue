<template>
  <div class="share-page">
    <div class="img-content">
      <img src="../../../asset/images/avator.jpg" alt="">
    </div>
    <div class="btn-line">
      <van-button @click="onClick" round size="large" type="danger">点击完善信息</van-button>
      <van-button style="margin-top: 10px;" @click="() => this.$router.push('/')" round size="large" type="warning">已有账号直接进入</van-button>
    </div>
  </div>
</template>
<script>
import { Button } from 'vant';

const memberMap = {
  vip: '等级2',
  agent: '等级3',
}

export default {
  name: 'Share',
  components: {
    [Button.name]: Button
  },
  data() {
    return {
      user_name: '',
      user_id: '',
      level: '',
    }
  },
  computed: {
    getLevelName() {
      return memberMap[this.level] || '';
    }
  },
  created() {
    // 在这个页面进行二维码链接的校验及其他处理逻辑
    const { query } = this.$route;
    if (!query || !query.user_id || !query.createTime || !query.user_name) {
      console.log(1);
      return this.$router.push('/list');
    }
    this.user_name = query.user_name;
    this.user_id = query.user_id;
    this.level = query.level || 'toper';
  },
  methods: {
    onClick() {
      if (!this.level || !this.user_name || !this.user_id) return;
      this.$router.push(`/register?level=${this.level}&username=${this.user_name}&user_id=${this.user_id}`);
    }
  }
}
</script>
<style lang="less" scoped>
.share-page {
  height: 100vh;
  background-color: thistle;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  flex-direction: column;
  .img-content {
    width: 100vw;
    position: relative;
    img {
      width: 100%;
    }
    .username {
      position: absolute;
      top: 36%;
      left: 35%;
      color: red;
      font-size: 14px;
      font-weight: 600;
    }
    .img-level {
      position: absolute;
      top: 40%;
      left: 59%;
      color: red;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .share-content {
    // background-color: #fff;
    border-radius: 10px;
    // padding: 0 0 30px 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      // width: 200px;
      // height: 200px;
    }
    .line {
      margin-bottom: 8px;
      color: gray;
      font-size: 16px;
      span {
        color: red;
        font-size: 18px;
        margin: 0 4px;
      }
    }
  }
  .btn-line {
    width: calc(100vw - 50px);
    margin: 10px 20px;
  }
}
</style>

