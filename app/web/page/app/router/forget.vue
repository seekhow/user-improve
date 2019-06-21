<template>
  <div>
    <van-nav-bar
      title="找回密码"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div style="margin-top: 46px;">
      <van-steps :active="active">
        <van-step>获取验证码</van-step>
        <van-step>修改密码</van-step>
        <van-step>找回成功</van-step>
      </van-steps>
      <van-cell-group v-if="active === 0">
        <van-field
          v-model="phone"
          label="手机号"
          clearable
          placeholder="请输入手机号"
        >
          <van-button
            @click="send"
            slot="button"
            size="small"
            type="primary"
            :disabled="hasClick"
          >
            {{ hasClick ? `${time}s` : '发送验证码' }}
          </van-button>
        </van-field>
        <van-field
          v-model="sms"
          center
          clearable
          label="短信验证码"
          placeholder="请输入短信验证码"
        />
        <van-button @click="onNext" style="margin: 10px; width: calc(100vw - 20px);" size="small" type="primary">下一步</van-button>
      </van-cell-group>
      <div v-if="active === 1">
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
        <van-button @click="onSubmitChange" style="margin: 10px; width: calc(100vw - 20px);" size="small" type="primary">修改密码</van-button>
      </div>
      <div v-if="active === 2" style="display: flex; align-items: center;flex-direction: column;">
        <van-icon name="success" size="30px" />
        <div>找回密码成功！</div>
        <van-button @click="onLogin" style="margin-top: 10px;" size="small" type="primary">直接进入</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs';
import Cookie from 'js-cookie';
import md5 from 'md5';
import { setInterval } from 'timers';

export default {
  name: 'Forget',
  data() {
    return {
      phone: '',
      sms: '',
      active: 0,
      phoneError: false,
      hasClick: false,
      time: 90,
      timer: null,
      pwd: '',
      repeat: '',
      pwdErrorMsg: '',
      repeatErrorMsg: '',
      showKeyboard: false
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/login');
    },
    send() {
      const { phone } = this;
      if (!this.isValidatePhone(phone)) {
        this.$toast.fail('请输入正确的手机号！');
        return null;
      }
      const lastTime = Cookie.get('last-sms-time') || dayjs().subtract(90, 'second').format('YYYY-MM-DD HH:mm:ss');
      this.$http.post('/api/user/sendSms', { phone, lastTime }).then(res => {
        if (res && !res.error) {
          const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          Cookie.set('last-sms-time', nowTime);
          this.hasClick = true;
          this.$toast('验证码发送成功！');
        } else {
          this.$toast.fail(res.message || '请求出错');
        }
      });
    },
    onNext() {
      const { phone, sms } = this;
      this.$http.post('/api/user/validateSmsCode', { phone, code: sms }).then(res => {
        if (res && !res.error) {
          this.active = 1;
        } else {
          this.$toast.fail('验证码错误！');
        }
      });
    },
    onSubmitChange() {
      const { phone, sms, pwd, repeat, pwdErrorMsg, repeatErrorMsg } = this;
      if (!phone || !pwd || !repeat || pwdErrorMsg || repeatErrorMsg) return null;
      const md5pwd = md5(pwd);
      this.$http.post('/api/user/noAuthChangePwd', { phone, code: sms, pwd: md5pwd }).then(res => {
        if (res && !res.error) {
          this.active = 2;
        } else {
          this.$toast.fail(res.message || '请求出错');
        }
      });
    },
    isValidatePhone(phone) {
      // 象征性校验一下
      if (phone.length !== 11) return false;
      return true;
    },
    onLogin() {
      const { phone, pwd } = this;
      const pwdmd5 = md5(pwd);
      this.$http.post('/api/user/login', { phone, password: pwdmd5 }).then(res => {
        if (!res.error) {
          this.$router.push('/');
        } else {
          this.$toast.fail('登录失败，请检查后重试！');
        }
      });
    }
  },
  watch: {
    hasClick(val, preVal) {
      if (val && !preVal) {
        this.timer = setInterval(() => {
          this.time--;
        }, 1000);
      }
    },
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

</style>
