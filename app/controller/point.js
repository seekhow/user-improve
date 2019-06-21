const Controller = require('egg').Controller;

class PointController extends Controller {
  async getCurrent() {
    const { ctx } = this;
    const { id } = ctx.session;
    const user = await ctx.model.User.findById(id, 'points');
    let data = {
      points: 0,
    };
    if (user) {
      data.points = user.points;
    }
    const list = await ctx.model.Point.find({ user: id }).lean();
    data.list = list;
    console.log(user);
    ctx.body = {
      error: false,
      data,
    }
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
    const list = await ctx.model.Point.find().populate('user', 'username level').lean();
    ctx.body = {
      error: false,
      data: list,
    }
  }

  async getCurrentRefund() {
    const { ctx } = this;
    const { id } = ctx.session;
    const list = await ctx.model.Refund.find({ user: id }).populate('user', 'username level').sort({ gmt_create: -1 }).lean();
    ctx.body = {
      error: false,
      data: list,
    }
  }
  
  async getRefundList() {
    const { ctx } = this;
    const { role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    const list = await ctx.model.Refund.find().populate('user', 'username level').sort({ gmt_create: -1 }).lean();
    ctx.body = {
      error: false,
      data: list,
    }
  }

  async agreeRefund() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    let res;
    try {
      res = await ctx.model.Refund.findOneAndUpdate({ _id: id, status: 'init' }, {
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
    ctx.body = {
      error: !Boolean(res),
    }
  }

  async rejectRefund() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    try {
      const res = await ctx.model.Refund.findOneAndUpdate({ _id: id, status: 'init' }, {
        status: 'reject',
        gmt_modify: Date.now(),
      }).lean();
      const res1 = await ctx.model.User.findOneAndUpdate({ _id: res.user }, {
        $inc: { points: Number(res.points) },
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
    ctx.body = {
      error: false,
    }
  }

  async createRefund() {
    const { ctx } = this;
    const { id } = ctx.session;
    const user = await ctx.model.User.findById(id, 'points');
    if (!user || !user.points) {
      ctx.body = {
        error: true
      };
      return;
    }
    const points = user.points;
    const data = {
      points,
      user: id,
      status: 'init',
    };
    try {
      const res = await ctx.model.Refund.create(data);
      const res1 = await ctx.model.User.findOneAndUpdate({ _id: id }, {
        $inc: { points: -Number(points) },
      })
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = {
        error: true,
        message: error,
      };
      ctx.status = 200;
      return;
    }
    ctx.body = {
      error: false,
    }
  }
}

module.exports = PointController;