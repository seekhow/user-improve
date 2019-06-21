<template>
  <div class="page">
    <van-nav-bar
      title="注册用户"
      left-text="返回"
      right-text="完成"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <van-cell-group>
      <van-field
        v-model="username"
        required
        clearable
        label="用户名"
        placeholder="请输入姓名"
      />
      <van-field
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入6-12位密码"
        required
        :error-message="pwdErrorMsg"
      />
      <van-field
        v-model="repeat"
        type="password"
        label="重复密码"
        placeholder="请再次输入密码"
        required
        :error-message="repeatErrorMsg"
      />
      <van-field
        v-model="phone"
        type="phone"
        label="手机号"
        placeholder="请输入11位手机号作为唯一凭证"
        required
        :error-message="phoneErrorMsg"
      />
      <van-field
        v-model="IDCard"
        required
        clearable
        label="微信号"
        placeholder="请输入微信号"
      />
    </van-cell-group>
    <van-cell-group style="margin-top: 10px;">
      <div @click="onRegionClick">
        <van-field
          v-model="addressLabel"
          required
          clearable
          disabled
          label="所在区域"
          placeholder="请点击选择"
          right-icon="arrow"
        />
      </div>
      <van-field
        v-model="addressDetail"
        required
        :disabled="!addressLabel"
        clearable
        label="详细地址"
        placeholder="请输入详细地址"
      />
    </van-cell-group>
    <van-cell-group style="margin-top: 10px;">
      <van-field
        v-model="leaderName"
        required
        disabled
        label="推荐人"
      />
      <div @click="() => this.showLevel = true">
        <van-field
          v-model="levelName"
          required
          disabled
          label="申请级别"
          right-icon="arrow"
        />
      </div>
    </van-cell-group>
    <van-cell-group style="margin-top: 10px;">
      <van-switch-cell
        v-model="isStore"
        title="是否认证为店铺"
        required
        label="如选择需同时上传店铺照片"
      />
    </van-cell-group>
    <van-cell-group style="margin-top: 10px;">
      <ImgUploader
        title="上传支付凭证截图"
        :onChange="onImgChange"
      />
    </van-cell-group>
    <van-cell-group style="margin-top: 10px;">
      <van-button @click="onClickRight" type="primary" class="submit-btn" round size="large">提交注册</van-button>
    </van-cell-group>
    <van-popup
      v-model="show"
      position="bottom"
    >
      <van-area :area-list="areaList" @cancel="onCancel" @confirm="onConfirm" />
    </van-popup>
    <van-popup
      v-model="showLevel"
      position="bottom"
    >
      <van-picker show-toolbar :columns="columns" @confirm="onLevelChange" @cancel="() => this.showLevel = false" />
    </van-popup>
  </div>
</template>
<script>
import md5 from 'md5';
import areaList from '../../../framework/utils/area';
import ImgUploader from './ImgUploader';
import { mapMutations } from 'vuex';

const memberMap = {
  vip: '等级1',
  agent: '等级2',
  toper: '等级3',
  union: '特殊用户',
}

export default {
  name: 'Register',
  components: {
    ImgUploader,
  },
  data() {
    return {
      areaList,
      username: '',
      password: '',
      repeat: '',
      phone: '',
      phoneErrorMsg: '',
      repeatErrorMsg: '',
      pwdErrorMsg: '',
      isIdError: false,
      buttonLoading: false,
      IDCard: '',
      addressDetail: '',
      addressLabel: '',
      addressRegion: [],
      show: false,
      showLevel: false,
      columns: [
        { text: '等级1', key: 'vip'},
        { text: '等级2', key: 'agent' },
        { text: '等级3', key: 'toper' }
      ],
      leaderName: '推荐人',
      leader: '',
      level: '',
      levelName: '申请级别',
      imgList: [],
      isStore: false,
    };
  },
  created() {
    const { query } = this.$route;
    if (!query || !query.level || !query.username || !query.user_id) {
      console.log(1);
      this.$toast.fail('无效的推荐人信息');
      return this.$router.push('/');
    }
    this.leaderName = query.username;
    this.leader = query.user_id;
    this.level = query.level;
    this.levelName = memberMap[this.level] || '未知身份';
  },
  methods: {
    ...mapMutations(['changeLoading']),
    onRegionClick() {
      this.show = true;
    },
    onClickLeft() {
      this.$router.back();
    },
    onClickRight() {
      const {
        username, password, repeat, phone, phoneErrorMsg, pwdErrorMsg,
        addressDetail, addressRegion, IDCard, isIdError, imgList,
        leaderName, leader, level, levelName, isStore,
      } = this;
      if (!username || !password || !repeat || !phone ||
          phoneErrorMsg || pwdErrorMsg || !addressDetail ||
          !IDCard || !imgList.length || !leader ||
          !leaderName || !level || !levelName)
      {
        return this.$toast.fail('注册信息有误，请检查！');
      }
      const pwd = md5(password);
      let payload = {
        username,
        password: pwd,
        phone,
        level,
        IDCard,
        addressRegion,
        addressDetail,
        leader,
        evidence: imgList,
        isStore: Boolean(isStore),
      };
      this.changeLoading(true);
      this.$http.post('/api/user/register', payload).then(res => {
        this.changeLoading(false);
        if (res.error) {
          this.$toast.fail(res.message || '注册失败，请重试！');
        } else {
          this.$toast.success('用户提交申请成功，请等待审核！');
          this.$http.post('/api/user/login', { phone, password: pwd }).then(rr => {
            if (rr && !rr.error) {
              this.$router.push('/');
            } else {
              this.$router.push('/login');
            }
          });
        }
      }).catch(err => {
        this.changeLoading(false);
      });
    },
    onConfirm(arr) {
      this.addressRegion = arr;
      this.addressLabel = arr.reduce((total, current) => total + current.name, '');
      this.show = false;
    },
    onCancel() {
      this.show = false;
    },
    onImgChange(list) {
      this.imgList = list;
    },
    onLevelChange(item) {
      this.level = item.key;
      this.levelName = item.text;
      this.showLevel = false;
    }
  },
  watch: {
    phone() {
      if (this.hasValidate) {
        this.hasValidate = false;
      }
    },
    repeat(val) {
      if (val !== this.password) {
        this.repeatErrorMsg = '密码不一致';
      } else {
        this.repeatErrorMsg = '';
      }
    },
    password(val) {
      const str = String(val);
      if (str && (str.length < 6 || str.length > 12)) {
        this.pwdErrorMsg = '请输入6-12位的密码！';
      } else {
        this.pwdErrorMsg = '';
      }
    },
    IDCard(val) {
      const isIDCard=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
      this.isIdError = !isIDCard.test(val);
    }
  }
}
</script>
<style lang="less">
.page {
  height: 100vh;
  background: #f9f5f5;
}
.submit-btn {
  margin: 20px 10px 10px 10px;
  width: calc(100vw - 20px);
  background-color: #fe725b;
  border: 1px solid #fe725b;
}
.sms-btn {
  background-color: #fe725b;
  border: 1px solid #fe725b;
}
</style>
