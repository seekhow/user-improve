<template>
  <van-cell-group>
    <van-cell :title="getTitle" @click="onExpand" required>
      <div slot="label" @click="onStop($event)" class="cell-desc-wrapper" >
        <van-uploader :after-read="onRead" :disabled="isUploaderDisabled" >
          <div class="img-action-wrapper">
            <van-icon name="plus" size="20px" style="top: 5px;" />
          </div>
        </van-uploader>
        <div
          v-for="(item, index) in list"
          :key="index"
          @click="onImageClick(index)"
          class="img-wrapper"
        >
          <img :src="item.url" :alt="item.key">
          <div class="img-delete" @click.stop="onDelete(item, index)">
            <van-icon name="cross" size="20px" />
          </div>
        </div>
      </div>
    </van-cell>
  </van-cell-group>
</template>
<script>
// import COS from 'cos-js-sdk-v5';
import { ImagePreview } from 'vant';
import { mapMutations } from 'vuex';

function Trim(str) {
  let result;
  result = str.replace(/(^\s+)|(\s+$)/g,"");
  result = result.replace(/\s/g,"");
  return result;
}
export default {
  name: 'ImgUploader',
  props: {
    onChange: Function,
    only: Boolean,
    title: String,
    images: Array, // 初始化，可以传入指定的图片链接列表
    isNew: {
      type: Boolean,
      default: true
    }, // 是否是新建，新建的话删除图片会直接删除cos上的图片，编辑的话只会删除记录里的
  },
  data() {
    return {
      expand: false,
      cos: null,
      progress: 0,
      list: [],
    };
  },
  computed: {
    getTitle() {
      const { title = '图片上传' } = this;
      if (this.progress === 1) {
        return `${title}(已完成)`;
      }
      if (this.progress === 0) {
        return title;
      }
      const progress = Math.round(this.progress.toFixed(2) * 100);
      return `${title}(${progress}%)`;
    },
    isUploaderDisabled() {
      if (this.only && this.list.length === 1) {
        return true;
      }
      return false;
    }
  },
  mounted() {
    this.initCos();
  },
  methods: {
    ...mapMutations(['changeLoading']),
    onDelete(item, index) {
      if (!item || !item.key) return;
      const self = this;
      if (this.isNew) {
        this.changeLoading(true);
        this.cos.deleteObject({
          Bucket: 'evidence-1258939303',
          Region: 'ap-chengdu',
          Key: item.key,
        }, function(err, data) {
          self.changeLoading(false);
          if (!err && data.statusCode === 204) {
            self.$toast('删除图片成功');
            self.list.splice(index, 1);
          } else {
            self.$toast('删除图片失败');
          }
        });
      } else {
        self.list.splice(index, 1);
      }
    },
    onExpand() {
      this.expand = !this.expand;
    },
    onImageClick(index) {
      const urls = this.list.map(x => x.url);
      ImagePreview({
        images: urls,
        startPosition: index,
      });
    },
    onUpClick(item, index) {
      if (!index) return;
      this.list.splice(index - 1, 0, item);
      this.list.splice(index + 1, 1);
    },
    onStop(e) {
      if (e && e.target && e.target.tagName === 'INPUT') {
        e.stopPropagation();
      }
    },
    getSTS(payload) {
      return this.$http.get('/api/getSTS', payload);
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
        Bucket: 'evidence-1258939303',
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
            Bucket: 'evidence-1258939303',
            Region: 'ap-chengdu',
            Key: fileName,
            Sign: false
          }, function (err, data) {
            self.changeLoading(false);
            if (err || !data.Url) {
              toast('上传成功，但获取图片链接失败！');
            } else {
              self.list.push({ key: fileName, url: data.Url });
              self.expand = true;
              toast.success('上传成功！');
            }
          });
        } else {
          self.changeLoading(false);
          toast('上传出错！');
        }
      });
    }
  },
  watch: {
    list: function(val) {
      this.onChange(val);
    },
    images: function(val) {
      if (val && Array.isArray(val)) {
        this.list = val;
        if (val.length) {
          this.expand = true;
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.swipe-right {
  height: 100%;
  width: 45px;
  text-align: center;
  line-height: 44px;
  background-color: red;
  color: #fff;
  font-size: 14px;
}
.cell-desc-wrapper {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
}
.img-action-wrapper {
  width: 75px;
  height: 70px;
  line-height: 70px;
  text-align: center;
  background: #f9f5f5;
  border-radius: 5px;
}
.img-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  margin: 5px;
  margin-top: 0;
  .img-delete {
    position: absolute;
    top: 0;
    right: 0;
  }
  img {
    width: 70px;
    height: 70px;
  }
}
</style>
