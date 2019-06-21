<template>
  <div class="admin">
    <div class="form-block">
      <h2>用户信息</h2>
      <van-cell-group>
        <van-cell icon="contact" title="头像" is-link to="/user/change-avator">
          <div style="display: flex; justify-content: flex-end;">
            <img v-if="user.avator" class="profile" :src="user.avator || '../../../asset/images/avator.jpg'" />
            <div v-else class="poster-card-avator">{{ user.username && user.username[0] || '' }}</div>
          </div>
        </van-cell>
        <van-cell icon="label-o" title="姓名" :value="user.username || ''" />
        <van-cell icon="phone-o" title="电话" :value="user.phone || ''" />
      </van-cell-group>
      <van-cell-group style="margin-top: 10px;">
        <van-cell icon="exchange" title="修改密码" is-link to="/user/change-pwd" />
        <van-cell icon="share" title="退出登录" is-link clickable @click="onLogout" />
      </van-cell-group>
    </div>
  </div>
</template>
<script>
import { Dialog } from 'vant';

export default {
  name: 'User',
  props: {
    user: { type: Object, default: () => ({}) },
  },
  methods: {
    onLogout() {
      const logout = () => this.$http.request('/api/user/logout');
      const router = this.$router;
      const toast = this.$toast;
      Dialog.confirm({
        title: '退出登录',
        message: '是否确定退出当前登录用户？'
      }).then(() => {
        logout().then(res => {
          if (res && !res.error) {
            router.push('/login');
          } else {
            toast('用户注销失败，请重试！');
          }
        });
      }).catch(() => {});
    },
  }
}
</script>
<style lang="less" scoped>
  .admin {
    background-color: #fafafa;
    padding-bottom: 15px;
    margin-bottom: 50px;
    overflow-y: scroll;
  }
  .form-block {
    h2 {
      margin: 0;
      font-weight: 400;
      font-size: 14px;
      color: rgba(69,90,100,.6);
      padding: 20px 15px 15px;
    }
  }
  .profile {
    width: 25px;
    height: 25px;
    border-radius: 25px;
  }
  .poster-card-avator {
    width: 25px;
    height: 25px;
    background-color: #f38c7c;
    color: #fff;
    font-size: 11px;
    border-radius: 25px;
    text-align: center;
    line-height: 25px;
  }
</style>
