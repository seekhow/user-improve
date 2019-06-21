<template>
  <div class="page">
    <div class="logo">
      <div class="letter">USER-IMPROVE</div>
      <div class="name">用户增长</div>
    </div>
    <van-cell-group>
      <van-field
        v-model="username"
        left-icon="phone-o"
        clearable
        label="ID号/手机号"
        placeholder="请输入手机号/用户id"
      />

      <van-field
        v-if="!isSms"
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        left-icon="points"
      />
      <van-field
        v-else
        v-model="sms"
        center
        clearable
        left-icon="points"
        label="短信验证码"
        placeholder="请输入短信验证码"
      >
        <van-button
          slot="button"
          size="small"
          type="primary"
          @click="postSms"
          :disabled="hasValidate"
          :loading="buttonLoading"
        >
          发送验证码
        </van-button>
      </van-field>
    </van-cell-group>
    <div class="actions">
      <van-button class="login-button" type="primary" size="large" @click="onButtonClick">立即登录</van-button>
      <div class="links">
        <div><router-link to="/register">立即注册</router-link></div>
        <div @click="onSwitchClick">{{ getSwitchText }}</div>
        <div><router-link to="/forget">忘记密码</router-link></div>
      </div>
    </div>
  </div>
</template>
<script>
import md5 from 'md5';

export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: '',
      isSms: false,
      sms: '',
      hasValidate: false,
      phoneErrorMsg: '',
      buttonLoading: false,
    };
  },
  computed: {
    getSwitchText() {
      const { isSms } = this;
      return isSms ? '使用密码的形式登录' : '使用手机验证码登录';
    }
  },
  methods: {
    onButtonClick() {
      if (this.isSms) {
        this.$api.loginBySms(this.username, this.sms).then(res => {
          if (!res.error) {
            this.$router.push('/');
          } else {
            this.$toast.fail('登录失败，请检查后重试！');
          }
        });
      } else {
        if (!this.username || !this.password) return;
        const pwd = md5(this.password);
        this.$http.post('/api/user/login', { phone: this.username, password: pwd }).then(res => {
          if (!res.error) {
            this.$router.push('/');
          } else {
            this.$toast.fail('登录失败，请检查后重试！');
          }
        });
      }
    },
    onSwitchClick() {
      this.isSms = !this.isSms;
    },
    postSms() {
      if (!this.isSms) return;
      if (!this.username) {
        // 需要检验一下手机号
        return this.$toast('手机号不能为空！')
      }
      if (this.username.length !== 11) {
        return this.$toast('手机号格式不合法');
      }
      if (Number.isNaN(Number(this.username))) {
        return this.$toast('手机号格式不合法');
      }
      if (this.username[0] !== '1') {
        return this.$toast('手机号格式不合法');
      }
      this.buttonLoading = true;
      this.$api.sendSms(this.username, 'LOGIN').then(res => {
        this.buttonLoading = false;
        if (res && !res.error) {
          this.hasValidate = true;
          this.$toast.success('验证码已发送，请在1分钟内填写！');
        } else {
          this.$toast.fail(res.message);
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
@themeClr: #fe725b;
.page {
  background-color: #fff;
  height: 100vh;
  width: 100%;
}
.logo {
  height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: @themeClr;
  .letter {
    font-size: 30px;
    font-weight: 700px;
    letter-spacing: 6px;
  }
  .name {
    margin-top: 20px;
    font-size: 35px;
    font-weight: 600;
    letter-spacing: 10px;
  }
}
.actions {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  .login-button {
    margin-top: 10px;
    width: calc(100% - 20px);
    height: 40px;
    line-height: 38px;
    border-radius: 4px;
    background-color: @themeClr;
    border: 1px solid @themeClr;
  }
  .links {
    width: calc(100% - 50px);
    color: @themeClr;
    margin-top: 10px;
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    a {
      color: @themeClr;
    }
  }
}
.van-field__button {
  button {
    background-color: @themeClr;
    border: 1px solid @themeClr;
  }
}
</style>
