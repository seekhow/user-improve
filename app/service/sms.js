'use strict';

const Service = require('egg').Service;

const QcloudSms = require('qcloudsms_js');
const _ = require('lodash');

const templateMap = {
  354786: '忘记密码',
  354805: '同意申请',
  334920: '拒绝申请',
};

class SmsService extends Service {
  async postSms(phone, params, templateId) {
    // if (!phone || !code || !time) return Promise.reject('SmsService: phone不能为空');
    const { sms } = this.app.config;
    if (!sms || !_.isPlainObject(sms)) return Promise.reject('SmsService: 找不到sms相关配置');
    const { appid, appkey, smsSign } = sms;
    if (!appid || !appkey || !templateId || !smsSign) return Promise.reject('SmsService: sms配置有误');

    const phoneNumbers = [ phone ];
    const qcloudsms = QcloudSms(appid, appkey);
    const ssender = qcloudsms.SmsSingleSender();
    const logger = this.logger;
    return new Promise((reslove, reject) => {
      ssender.sendWithParam(86, phoneNumbers[0], templateId, params, smsSign, '', '',
        err => {
          if (err) {
            logger(err);
            reject(err);
          } else {
            logger.info('短信发送成功', templateMap[templateId], phone, params);
            reslove('短信发送成功');
          }
        }
      );
    });
  }

  async forgetSms(phone, code) {
    const params = [ code, 2 ];
    await this.postSms(phone, params, 354786);
  }

  async agreeCheckSms(phone, username) {
    const params = [ username ];
    await this.postSms(phone, params, 354805);
  }

  async rejectCheckSms(phone, username) {
    const params = [ username ];
    await this.postSms(phone, params, 334920);
  }
}
module.exports = SmsService;
