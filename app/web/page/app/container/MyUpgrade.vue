<template>
  <div>
    <van-nav-bar
      title="升级信息"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="content">
      <van-panel icon="weapp-nav" title="当前等级" desc="请查看下方升级说明" :status="currentLevel">
        <template>
          <van-steps
            :active="currentActive"
            active-icon="success"
            active-color="#fe725b"
            style="margin: 5px 10px;"
          >
            <van-step
              v-for="(item, index) in currentStepArr"
              :key="index"
            >
              {{ item }}
            </van-step>
          </van-steps>
          <div
            slot="footer"
            style="display: flex;justify-content: flex-end;"
            v-if="isShowUpgradeBtn"
          >
            <van-button
              v-if="showBtn && currentUser.level === 'vip'"
              @click="onClickUpgrade('agent')"
              style="margin-right: 10px;"
              size="small"
              type="danger"
            >
              升级到等级2
            </van-button>
            <van-button
              v-if="showBtn && currentUser.level === 'agent'"
              @click="onClickUpgrade('toper')"
              size="small"
              type="danger"
            >
              升级到等级3
            </van-button>
            <van-button
              v-if="showBtn && currentUser.level === 'toper'"
              @click="onClickUpgrade('union')"
              size="small"
              type="danger"
            >
              升级到特殊用户
            </van-button>
            <div
              @click="() => this.$router.push(`/upgrade/${data._id}`)"
              v-else-if="data && data._id"
              style="font-size: 11px;color: red;text-decoration:underline;"
            >
              您已提交过升级申请，点击查看
            </div>
          </div>
        </template>
      </van-panel>
      <div class="record-title">升级说明</div>
      <van-collapse v-model="activeName">
        <van-collapse-item title="等级3" name="1">
          升级要求
        </van-collapse-item>
        <van-collapse-item title="等级2" name="2">
          升级要求
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>
<script>
const columns = [
  { key: 'vip', text: '等级1' },
  { key: 'agent', text: '等级2' },
  { key: 'toper', text: '等级3' },
];

export default {
  name: 'Upgrade',
  data() {
    return {
      activeName: ['1', '2'],
      showBtn: false,
      data: {},
      stepArr: ['等级1', '等级2', '等级3', '特殊用户'],
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user;
    },
    currentLevel() {
      const user = this.$store.state.user;
      const { level, isUnion } = user;
      let res = (columns.find(x => x.key === level) || {}).text || '';
      if (this.isBoss()) return '发起者';
      if (isUnion) return '特殊用户';
      return res;
    },
    currentActive() {
      if (this.isBoss()) {
        return 4;
      }
      const user = this.$store.state.user;
      const { isUnion, level } = user;
      if (isUnion) return 3;
      const index = columns.findIndex(x => x.key === level) || 0;
      return index;
    },
    currentStepArr() {
      const { stepArr } = this;
      if (this.isBoss()) {
        return [...stepArr, '发起者'];
      }
      return stepArr;
    },
    isShowUpgradeBtn() {
      const user = this.$store.state.user;
      if (user.isUnion) return false;
      return true;
    }
  },
  mounted() {
    this.$http.get('/api/upgrade/getCurrent').then(res => {
      if (res && !res.error) {
        this.showBtn = !Boolean(res.data);
        this.data = res.data;
      }
    });
  },
  methods: {
    isBoss() {
      const user = this.$store.state.user;
      if (user._id == '5cef9d6ecf1dec0648685e83') {
        return true;
      }
      return false;
    },
    onClickLeft() {
      this.$router.push('/');
    },
    onClickUpgrade(level) {
      this.$http.post('/api/upgrade/create', { target_level: level }).then(res => {
        console.log(res);
        if (res && !res.error && res.data) {
          this.$router.push(`/upgrade/${res.data}`);
        } else {
          this.$toast.fail(res.message || '操作失败！');
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.content {
  height: calc(100vh - 96px);
  margin-top: 46px;
  margin-bottom: 50px;
  .record-title {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: gray;
  }
}
</style>
