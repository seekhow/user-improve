<template>
  <div>
    <van-nav-bar
      :title="getTitle"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="refund-content">
      <template v-if="list.length">
        <div @click="onCardClick(item._id)" class="poster-card" v-for="item in list" :key="item._id">
          <div class="poster-card-avator">{{ item.username && item.username[0] || '' }}</div>
          <div class="poster-card-content">
            <van-row>
              <van-col>姓名: <span>{{ `${item.username}(${formatLevel(item.level, item.isUnion)})` }}</span></van-col>
            </van-row>
            <van-row style="margin-top: 5px;">
              <van-col>手机号：<span>{{ item.phone }}</span></van-col>
            </van-row>
            <van-row style="margin-top: 5px;">
              <van-col>加入时间：<span>{{ formatTime(item.gmt_create) }}</span></van-col>
            </van-row>
          </div>
        </div>
      </template>
      <div v-else class="no-data-title">暂无数据~</div>
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

export default {
  name: 'Grouper-list',
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    this.getList();
  },
  computed: {
    getTitle() {
      const { list } = this;
      if (!list.length) return '已推荐成员列表';
      return `已推荐成员-共${list.length}人`;
    }
  },
  methods: {
    onCardClick(id) {
      if (!id) return;
      this.$router.push(`/grouper/${id}`);
    },
    getList() {
      this.$http.get('/api/user/getGrouperList').then(res => {
        if (res && !res.error && Array.isArray(res.data)) {
          this.list = res.data;
        } else {
          this.$toast.fail('获取数据失败');
        }
      })
    },
    onClickLeft() {
      this.$router.push('/');
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
  }
}
</script>
<style lang="less" scoped>
.refund-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
.record-title {
  text-align: center;
  font-size: 14px;
  color: gray;
}
.right-action {
  text-align: right;
  font-size: 11px;
  color: rgb(66, 145, 235);
  margin-right: 10px;
}
.poster-card {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px #efebeb82 solid;
  .poster-card-avator {
    width: 40px;
    height: 40px;
    background-color: #fe725b;
    color: #fff;
    font-size: 20px;
    border-radius: 100%;
    text-align: center;
    line-height: 40px;
  }
  .poster-card-content {
    flex: 1;
    margin-left: 20px;
    font-size: 13px;
    span {
      color: gray;
    }
  }
}
</style>
