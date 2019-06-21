const Controller = require('egg').Controller;

class UpgradeController extends Controller {
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
    const list = await ctx.model.Upgrade.find().populate('user', 'username level').lean();
    ctx.body = {
      error: false,
      data: list,
    }
  }

  async getCurrent() {
    const { ctx } = this;
    const { id: user_id } = ctx.session;
    const res = await ctx.model.Upgrade
      .findOne({ user: user_id, status: { $in: [ 'init', 'paid' ] } })
      .populate('user', 'level')
      .lean();
    ctx.body = {
      error: false,
      data: res,
    }
  }

  async getOne() {
    const { ctx } = this;
    const { id: user_id } = ctx.session;
    const { id } = ctx.params;
    const res = await ctx.model.Upgrade.findOne({ _id: id }).populate('user', 'username').lean();
    ctx.body = {
      error: !Boolean(res),
      data: res,
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
      res = await ctx.model.Upgrade.findOneAndUpdate({ _id: id, status: 'init' }, {
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

  async agreePlan() {
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
      res = await ctx.model.Upgrade.findOneAndUpdate({ _id: id, status: 'paid' }, {
        status: 'finish',
        gmt_modify: Date.now(),
      }).lean();
      let ret;
      if (res.target_level === 'union') {
        ret = await ctx.model.User.findOneAndUpdate({ _id: res.user }, { level: 'toper', isUnion: true });
      } else {
        ret = await ctx.model.User.findOneAndUpdate({ _id: res.user }, { level: res.target_level });
      }
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
      res = await ctx.model.Upgrade.findOneAndUpdate({ _id: id, status: 'paid' }, {
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

  async remove() {
    const { ctx } = this;
    const { id: user_id } = ctx.session;
    const { id } = ctx.params;
    let res;
    try {
      res = await ctx.model.Upgrade.findOneAndRemove({ _id: id, user: user_id });
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

  async create() {
    const { ctx } = this;
    const { id } = ctx.session;
    try {
      ctx.validate({
        target_level: { type: 'enum', values: ['agent', 'toper', 'union'] },
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
    const { target_level } = ctx.request.body;
    const user = await ctx.model.User.findById(id, '-password').lean();
    if (!user) {
      ctx.logger.error('用户不存在', id);
      ctx.body = {
        error: true,
        message: '用户不存在',
      };
      ctx.status = 200;
      return;
    }
    // if (user.level === 'toper') {
    //   ctx.logger.error('用户等级已达到最高', id);
    //   ctx.body = {
    //     error: true,
    //     message: '用户等级已达到最高',
    //   };
    //   ctx.status = 200;
    //   return;
    // }
    const preUpgrade = await ctx.model.Upgrade.findOne({ user: id, status: 'init' }).lean();
    if (preUpgrade) {
      ctx.logger.error('用户已提交过升级申请', id);
      ctx.body = {
        error: true,
        message: '用户已提交过申请',
      };
      ctx.status = 200;
      return;
    }
    const payload = {
      source_level: user.level,
      target_level,
      user: id,
      status: 'init',
    };
    let res;
    try {
      res = await ctx.model.Upgrade.create(payload);
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
      data: res._id,
    };
  }
}

module.exports = UpgradeController;