const Controller = require('egg').Controller;

class CosController extends Controller {
  async getSTS() {
    const { ctx } = this;
    const res = await ctx.service.cos.sts();
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getAvatorSTS() {
    const { ctx } = this;
    const res = await ctx.service.cos.getAvatorSTS();
    ctx.body = {
      error: false,
      data: res,
    };
  }
}

module.exports = CosController;