const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('app.js', { url: this.ctx.url });
  }
}

module.exports = HomeController;