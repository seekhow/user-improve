<template>
  <Layout>
    <router-view />
    <div v-if="loading" class="loading">
      <van-loading size="40px" color="#c9c9c9" />
    </div>
  </Layout>
</template>
<script type="text/babel">
import Layout from 'component/layout/app/index.vue';
import { mapState, mapMutations } from 'vuex';

export default {
  components: {
    Layout
  },
  computed: {
    ...mapState(['loading'])
  },
  methods: {
    ...mapMutations(['changeLoading']),
    onMaskClick() {
      this.changeLoading(true);
    }
  },
}
</script>

