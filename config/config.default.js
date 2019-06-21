const path = require('path');
const fs = require('fs');

module.exports = app => {
  const exports = {
    cors: {
      // origin: 'http://localhost:7001',
      allowMethods: 'GET,HEAD,POST,OPTIONS',
      credentials: true,
    },
  };

  // 在这里填你腾讯云SMS的相关信息
  exports.sms = {
    appid: -1,
    appkey: '',
    smsSign: '',
  }

  // 在这里填你腾讯云COS的相关信息
  exports.cos = {
    secretId: '',
    secretKey: '',
    proxy: '',
    durationSeconds: 3000,
    bucket: '',
    region: '',
    allowPrefix: '*',
    // 密钥的权限列表
    allowActions: [
      // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
      // 简单上传
      'name/cos:PutObject',
      'name/cos:DeleteObject',
    ],
  };

  exports.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/user-improve',
      options: {
        poolSize: 10,
        // 开启了mongodb认证的话，下面两个选项配置用户和密码
        user: 'improver',
        pass: 'improver',
      },
    },
  };

  exports.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/asset/images/favicon.ico'))
  };

  exports.view = {
    cache: false
  };

  exports.vuessr = {
    layout: path.join(app.baseDir, 'app/web/view/layout.html'),
    renderOptions: {
      // 告诉 vue-server-renderer 去 app/view 查找异步 chunk 文件
      basedir: path.join(app.baseDir, 'app/view')
    }
  };

  exports.session = {
    key: 'SESS',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
    renew: true,
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(app.baseDir, 'logs')
  };

  exports.static = {
    prefix: '/public/',
    dir: path.join(app.baseDir, 'public')
  };

  exports.keys = '123456';

  exports.middleware = [
    'access'
  ];

  return exports;
};
