<template>
  <div>
    <van-nav-bar
      title="我要补货"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="content">
      <van-card
        class="card"
        v-for="item in list"
        :key="item._id"
        :num="item.remain || 0"
        :price="currentPrice"
        :origin-price="item.originPrice"
        :desc="item.desc"
        :title="item.name"
        :thumb="item.cover || 'https://img-1258939303.cos.ap-chengdu.myqcloud.com/logo_squre.png'"
      >
        <div slot="title" class="card-title">
          {{ item.name }}
        </div>
        <div slot="thumb" style="padding: 10px;">
          <img :src="item.cover || 'https://img-1258939303.cos.ap-chengdu.myqcloud.com/logo_s.jpg'" alt="" />
        </div>
        <div slot="num">
          <span v-if="!isEdit">库存剩余：{{ item.remain }}</span>
          <van-stepper
            v-else
            integer
            :min="minNum"
            @change="val => onStepChange(val, item._id)"
          />
        </div>
      </van-card>
      <van-button v-if="!isEdit" @click="switchEdit" type="warning" class="submit-btn" size="large">提交补货计划</van-button>
      <div v-else class="submit-actions">
        <van-button @click="finishEdit" type="danger" >确定</van-button>
        <van-button @click="cancelEdit" type="primary">取消</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
export default {
  name: 'Product',
  data() {
    return {
      list: [],
      loading: false,
      isEdit: false,
      num: 12,
      planMap: {},
      minNum: 0,
      currentPrice: 0,
    };
  },
  mounted() {
    this.getList();
    this.getValidLimit();
  },
  methods: {
    ...mapMutations(['changeLoading']),
    getValidLimit() {
      this.changeLoading(true);
      this.$http.get('/api/plan/getValidLimit').then(res => {
        this.changeLoading(false);
        if (res && !res.error && res.data && Array.isArray(res.data) && res.data.length === 2) {
          const [price, minNum] = res.data;
          this.minNum = minNum;
          this.currentPrice = price;
        } else {
          this.$toast(res.message);
        }
      }).catch(() => this.changeLoading(false));
    },
    getList() {
      this.changeLoading(true);
      this.$http.get('/api/product/list').then(res => {
        this.changeLoading(false);
        if (res && !res.error && res.data && Array.isArray(res.data)) {
          this.list = res.data;
        } else {
          this.$toast(res.message);
        }
      }).catch(() => this.changeLoading(false));
    },
    onClickLeft() {
      this.$router.push('/');
    },
    onItemClick(goods_id) {
      if (!goods_id) return;
      this.$router.push(`/admin/goods-detail/${goods_id}`);
    },
    switchEdit() {
      this.isEdit = true;
      if (this.list.length) {
        const item = this.list[0];
        this.planMap[item._id] = this.minNum;
      }
    },
    finishEdit() {
      this.isEdit = false;
      this.submitPlan();
    },
    cancelEdit() {
      this.isEdit = false;
    },
    onStepChange(num, id) {
      this.planMap[id] = num;
    },
    submitPlan() {
      const content = Object.keys(this.planMap).map(x => ({
        product: x,
        number: this.planMap[x],
      }));
      this.$http.post('/api/plan/create', { content }).then(res => {
        if (res && !res.error && res.data) {
          this.$toast.success('提交补货计划成功！');
          this.$router.push(`/plan/${res.data}`);
        } else {
          this.$toast(res.message);
        }
      });
    }
  },
}
</script>
<style lang="less" scoped>
.content {
  height: calc(100vh - 96px);
  margin-top: 46px;
  margin-bottom: 50px;
  position: relative;
}
.card {
  font-size: 14px;
  .card-title {
    font-size: 16px;
    margin-top: 1px;
  }
}
.submit-btn {
  position: absolute;
  bottom: 0;
}
.submit-actions {
  width: 100vw;
  display: flex;
  position: absolute;
  bottom: 0px;
  button {
    width: 50vw;
  }
}
</style>
<style lang="less">
.van-card__bottom {
  margin-top: 8px;
}
.van-card__content, .van-card__thumb {
  height: 70px;
}
</style>
