const Controller = require('egg').Controller;

class ProductController extends Controller {
  async getList() {
    const { ctx } = this;
    const res = await ctx.model.Product.find({ used: true });
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getOne() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Product.findById(id);
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getRemain() {
    const { ctx } = this;
    const { id } = ctx.session;
    const product = await ctx.model.Product.findById('5ce01b784f4fec230c35b556'); // 写死了
    const user = await ctx.model.User.findById(id, 'remain');
    const planList = await ctx.model.Plan.find({ user: id });
    console.log(user);
    ctx.body = {
      error: false,
      data: {
        product,
        remain: user.remain,
        list: planList,
      }
    }
  }
}

module.exports = ProductController;