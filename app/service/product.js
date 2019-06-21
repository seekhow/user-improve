'use strict';

const Service = require('egg').Service;

class ProductService extends Service {
  async getValidNum(level, id) {
    const { ctx } = this;
    const levelList = await ctx.model.Level.find();
    const levelConfig = levelList.find(x => x.key === level);
    if (!levelConfig || !levelConfig._id) {
      ctx.logger.error('未查询到相关配置', levelConfig, level);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return null;
    }
    const prePlan = await ctx.model.Plan.find({ user: id });
    if (prePlan && prePlan.length) {
      // 之前有提交记录
      return [levelConfig.unitPrice, levelConfig.min];
    } else if (levelConfig.firstPrice !== undefined && levelConfig.firstMin !== undefined) {
      return [levelConfig.firstPrice, levelConfig.firstMin];
    } else {
      return [levelConfig.unitPrice, levelConfig.min];
    }
  }
}

module.exports = ProductService;