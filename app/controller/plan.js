const Controller = require('egg').Controller;

class PlanController extends Controller {
  async getList() {
    const { ctx } = this;
    const { status } = ctx.query;
    let obj = {};
    if (status) {
      obj.status = status;
    }
    const res = await ctx.model.Plan.find(obj).populate('user', '-password');
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getOne() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = await ctx.model.Plan.findById(id).populate('product user');
    ctx.body = {
      error: false,
      data,
    };
  }

  async getValidLimit() {
    const { ctx } = this;
    const { id, level } = ctx.session;
    const limit = await ctx.service.product.getValidNum(level, id);
    ctx.body = {
      error: false,
      data: limit,
    }
  }

  async remove() {
    const { ctx } = this;
    const { id: user_id } = ctx.session;
    const { id } = ctx.params;
    let res;
    try {
      res = await ctx.model.Plan.findOneAndRemove({ _id: id, user: user_id });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    if (res) {
      ctx.body = {
        error: false,
        data: res._id,
      };
    } else {
      ctx.body = {
        error: true,
        message: '取消失败',
      }
    }
  }

  async agreePlan() {
    const { ctx } = this;
    const { role, id: user_id } = ctx.session;
    const { id } = ctx.params;
    if ((role !== 'admin') && (role !== 'super')) {
      ctx.body = {
        error: true,
        message: '401',
      };
      ctx.status = 200;
      return;
    }
    let res, ret;
    try {
      res = await ctx.model.Plan.findOneAndUpdate({ _id: id, status: 'paid' }, {
        status: 'finish',
        gmt_modify: Date.now(),
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    try {
      ret = await ctx.model.User.findOneAndUpdate({ _id: user_id }, {
        $inc: { remain: res.content },
      });
    } catch (error) {
      await ctx.model.Plan.findOneAndUpdate({ _id: id, status: 'finish' }, {
        status: 'paid',
        gmt_modify: Date.now(),
      });
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    if (res && ret) {
      ctx.body = {
        error: false,
        data: res._id,
      };
    } else {
      ctx.body = {
        error: true,
        message: '更新失败',
      }
    }
  }

  async rejectPlan() {
    const { ctx } = this;
    const { role } = ctx.session;
    const { id } = ctx.params;
    if ((role !== 'admin') && (role !== 'super')) {
      ctx.body = {
        error: true,
        message: '401',
      };
      ctx.status = 200;
      return;
    }
    let res;
    try {
      res = await ctx.model.Plan.findOneAndUpdate({ _id: id, status: 'paid' }, {
        status: 'reject',
        gmt_modify: Date.now(),
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    if (res) {
      ctx.body = {
        error: false,
        data: res._id,
      };
    } else {
      ctx.body = {
        error: true,
        message: '更新失败',
      }
    }
  }

  async updateEvi() {
    const { ctx } = this;
    const { id } = ctx.params;
    try {
      ctx.validate({
        evidence: { type: 'array' },
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    const { evidence } = ctx.request.body;
    let res;
    try {
      res = await ctx.model.Plan.findOneAndUpdate({ _id: id, status: 'init' }, {
        status: 'paid',
        evidence,
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    if (res) {
      ctx.body = {
        error: false,
        data: res._id,
      };
    } else {
      ctx.body = {
        error: true,
        message: '更新失败',
      }
    }
  }

  async create() {
    const { ctx } = this;
    const { id, level } = ctx.session;
    try {
      ctx.validate({
        content: { type: 'array', itemType: 'object', min: 1, max: 1, rule: {
          product: { type: 'string' },
          number: { type: 'number' },
        }},
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    const { content } = ctx.request.body;
    if (content[0].product !== '5ce01b784f4fec230c35b556') {
      ctx.logger.error('不是指定产品', content);
      ctx.body = {
        error: true,
        message: `不是指定的产品`,
      };
      ctx.status = 200;
      return;
    }
    const limit = await ctx.service.product.getValidNum(level, id);
    if (!limit) {
      ctx.logger.error('getValidNum错误', level, id);
      ctx.body = {
        error: true,
        message: `getValidNum错误`,
      };
      ctx.status = 200;
      return;
    }
    const [ price, minNum ] = limit;
    const currentNum = content[0].number;
    if (!currentNum || (currentNum < minNum)) {
      ctx.logger.error('产品数目未达到指定标准', content, minNum);
      ctx.body = {
        error: true,
        message: '产品数目未达到指定标准',
      };
      ctx.status = 200;
      return;
    }
    const payload = {
      content: currentNum,
      product: content[0].product,
      status: 'init',
      user: id,
      currentPrice: price,
      currentTotal: price * currentNum,
    };
    let res;
    try {
      res = await ctx.model.Plan.create(payload);
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    if (res) {
      ctx.body = {
        error: false,
        data: res._id,
      };
    } else {
      ctx.body = {
        error: true,
        message: '创建失败',
      }
    }
  }
}

module.exports = PlanController;