<template>
  <div>
    <van-nav-bar
      title="修改头像"
      left-text="返回"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <div class="ava-content">
      <div style="display: flex;justify-content: center;" @click="onImgClick">
        <img width="250" height="250" :src="imgUrl" alt="">
      </div>
      <div style="display: flex;justify-content: center;">
        <van-uploader :after-read="onRead" >
          <van-button style="margin: 10px;" type="info">上传头像</van-button>
        </van-uploader>
      </div>
    </div>
  </div>
</template>
<script>
function Trim(str) {
  let result;
  result = str.replace(/(^\s+)|(\s+$)/g,"");
  result = result.replace(/\s/g,"");
  return result;
}
import { mapMutations } from 'vuex';
import { ImagePreview } from 'vant';
export default {
  name: 'ChangeAvator',
  data() {
    const user = this.$store.state.user;
    let url = '';
    if (user && user.avator) {
      url = user.avator;
    }
    return {
      cos: null,
      imgUrl: url,
    };
  },
  mounted() {
    this.initCos();
  },
  methods: {
    ...mapMutations(['changeLoading']),
    onClickLeft() {
      this.$router.push('/');
    },
    onImgClick() {
      const { imgUrl } = this;
      if (!imgUrl) return;
      ImagePreview({
        images: [imgUrl],
        startPosition: 0,
      });
    },
    updateAvator(url) {
      this.$http.post('/api/user/changeAvator', { imgUrl: url }).then((res) => {
        this.changeLoading(false);
        if (res && !res.error) {
          this.$toast('修改头像成功');
          this.$store.dispatch('getUserData'),
          this.$router.push('/');
        }
      }).catch(err => {
        this.changeLoading(false);
      });
    },
    onRead(res) {
      const { file, content } = res;
      const toast = this.$toast;
      const self = this;
      if (!res || !file || !content || !file.name) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return toast('图片大小不能超过5MB');
      }
      let fileName = Trim(file.name);
      fileName = Date.now() + fileName;
      this.changeLoading(true);
      this.cos.putObject({
        Bucket: 'avator-1258939303',
        Region: 'ap-chengdu',
        Key: fileName,
        StorageClass: 'STANDARD',
        Body: file,
        onProgress: function(progressData) {
          self.progress = progressData.percent;
        }
      }, function(err, data) {
        if (!err && data && data.statusCode === 200) {
          self.cos.getObjectUrl({
            Bucket: 'avator-1258939303',
            Region: 'ap-chengdu',
            Key: fileName,
            Sign: false
          }, function (err, data) {
            if (err || !data.Url) {
              self.changeLoading(false);
              toast('上传成功，但获取图片链接失败！');
            } else {
              self.imgUrl = data.Url;
              self.updateAvator(data.Url);
              // toast.success('上传成功！');
            }
          });
        } else {
          self.changeLoading(false);
          toast('上传出错！');
        }
      });
    },
    getSTS(payload) {
      return this.$http.get('/api/cos/getAvatorSTS', payload);
    },
    initCos() {
      const COS = require('cos-js-sdk-v5');
      const getSTS = this.getSTS;
      const cos = new COS({
        getAuthorization: (options, callback) => {
          getSTS({
            bucket: options.Bucket,
            region: options.Region
          }).then(res => {
            let data = {};
            try {
              data = JSON.parse(res.data);
            } catch (error) {
              return;
            }
            const credentials = data.credentials || {};
            callback({
              TmpSecretId: credentials.tmpSecretId,
              TmpSecretKey: credentials.tmpSecretKey,
              XCosSecurityToken: credentials.sessionToken,
              ExpiredTime: data.expiredTime, // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
            });
          });
        }
      });
      this.cos = cos;
    },
  }
}
</script>
<style lang="less" scoped>
.ava-content {
  margin-top: 46px;
  margin-bottom: 50px;
}
</style>
