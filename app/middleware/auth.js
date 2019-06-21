'use strict';

const _ = require('lodash');

module.exports = () => {
  return async function auth(ctx, next) {
    const { session } = ctx;
    if (session && _.isObject(session) && Object.keys(session).length > 0 && session.id && session.username && session.phone) {
      const { url = '' } = ctx.request;
      if (url.startsWith('/api/admin') && ![ 'admin', 'super' ].includes(session.role)) {
        ctx.body = '无效的Token，请重新登录';
        ctx.status = 401;
        return;
      }
      ctx.logger.info(`[Auth]`, session.phone, session.username, session.role);
      await next();
    } else {
      ctx.body = 'Token已过期';
      ctx.status = 401;
    }
  };
};
