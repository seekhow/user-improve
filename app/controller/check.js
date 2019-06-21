const Controller = require('egg').Controller;

class CheckController extends Controller {
  async agree() {
    const { ctx } = this;
    const { role } = ctx.session;
    const { id } = ctx.request.body;
    if (!id) {
      ctx.body = {
        error: true,
      };
      return null;
    }
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    const res = await ctx.service.user.agreeCheck(id);
    ctx.body = {
      error: !Boolean(res),
    };
  }

  async refuse() {
    const { ctx } = this;
    const { role } = ctx.session;
    const { id } = ctx.request.body;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    if (!id) {
      ctx.body = {
        error: true,
      };
      return null;
    }
    let res;
    try {
      res = await ctx.model.Apply.findOneAndUpdate({ _id: id, status: 'init' }, { status: 'reject' }).lean();
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
      await ctx.service.sms.rejectCheckSms(res.phone, res.username);
    } catch (error) {
      ctx.logger.error(error);
    }
    ctx.body = {
      error: false,
    }
    ctx.body = {
      error: false,
    };
  }

  async getList() {
    const { ctx } = this;
    const { role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    const res = await ctx.model.Apply.find({ status: 'init' }, `
      -password -addressRegion -evidence -addressDetail -IDCard -leader -role -phone
    `);
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getOne() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { role } = ctx.session;
    if (!id) {
      ctx.body = {
        error: true,
      };
      return null;
    }
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    const res = await ctx.model.Apply.findById(id, `
      -password
    `).populate('leader', 'username phone');
    if (!res) {
      ctx.body = {
        error: true,
      };
      return null;
    }
    ctx.body = {
      error: false,
      data: res,
    };
  }
}

module.exports = CheckController;