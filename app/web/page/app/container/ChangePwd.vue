<template>
  <div>
    <van-nav-bar
      title="修改密码"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
      right-text="确认"
      @click-right="onClickRight"
    />
    <div class="pwd-content">
      <van-field
        v-model="pre"
        type="password"
        label="原密码"
        placeholder="请输入原密码"
        required
        :error-message="preErrorMsg"
      />
      <van-field
        v-model="pwd"
        type="password"
        label="新密码"
        placeholder="请输入新密码"
        required
        :error-message="pwdErrorMsg"
      />
      <van-field
        v-model="repeat"
        type="password"
        label="密码确认"
        placeholder="请再次输入新密码"
        required
        :error-message="repeatErrorMsg"
      />
    </div>
  </div>
</template>
<script>
import md5 from 'md5';

export default {
  name: 'ChangePwd',
  data() {
    return {
      pre: '',
      pwd: '',
      repeat: '',
      preErrorMsg: '',
      repeatErrorMsg: '',
      pwdErrorMsg: '',
      canSubmit: false,
    };
  },
  methods: {
    onClickLeft() {
      this.$router.push('/user');
    },
    onClickRight() {
      if (!this.pre) return this.$toast('原密码不能为空');
      if (this.repeatErrorMsg || this.pwdErrorMsg) return this.$toast('两次输入的新密码不一致！');
      this.$http.post('/api/user/changePwd', { pre: md5(this.pre), pwd: md5(this.pwd) }).then(res => {
        if (res && !res.error) {
          this.$toast('修改密码成功');
          this.$router.push('/user');
        } else {
          this.$toast(res && res.message);
        }
      });
    }
  },
  watch: {
    repeat(val) {
      if (!val) return;
      if (val !== this.pwd) {
        this.repeatErrorMsg = '两次输入的密码不一致';
      } else {
        this.repeatErrorMsg = '';
      }
    },
    pwd(val) {
      const str = String(val);
      if (str && (str.length < 6 || str.length > 12)) {
        this.pwdErrorMsg = '请输入6-12位的密码！';
      } else {
        this.pwdErrorMsg = '';
      }
    }
  }
}
</script>
<style lang="less" scoped>
.pwd-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
</style>
