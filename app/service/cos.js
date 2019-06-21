'use strict';

const Service = require('egg').Service;
const STS = require('qcloud-cos-sts');

class CosService extends Service {
  async sts() {
    // 获取临时密钥
    const config = this.app.config.cos;
    const LongBucketName = config.bucket;
    const ShortBucketName = LongBucketName.substr(0, LongBucketName.indexOf('-'));
    const AppId = LongBucketName.substr(LongBucketName.indexOf('-') + 1);
    const policy = {
      version: '2.0',
      statement: [{
        action: config.allowActions,
        effect: 'allow',
        principal: { qcs: [ '*' ] },
        resource: [
          'qcs::cos:ap-chengdu:uid/' + AppId + ':prefix//' + AppId + '/' + ShortBucketName + '/' + config.allowPrefix,
        ],
      }],
    };
    const res = await this.getCredential(policy);
    return res;
  }

  async getCredential(policy) {
    const config = this.app.config.cos;
    return new Promise(resolve => {
      STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        policy,
      }, function(err, tempKeys) {
        const result = JSON.stringify(err || tempKeys) || '';
        resolve(result);
      });
    });
  }
}

module.exports = CosService;
