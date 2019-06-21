const Controller = require('egg').Controller;
const dayjs = require('dayjs');

function getRandomCode(max = 9999, min = 1000) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return String(num);
}

class UserController extends Controller {
  async index() {
    const { ctx } = this;
    const { id } = ctx.session;
    const res = await ctx.model.User.findById(id, `
      -password -addressRegion -evidence -addressDetail -IDCard -remain
    `).populate('leader', '-password -addressRegion -evidence -addressDetail -IDCard -remain');
    let user = null;
    if (res) user = res.toObject();
    ctx.body = {
      error: false,
      data: user,
    };
  }

  async sendSms() {
    const { ctx } = this;
    try {
      ctx.validate({
        phone: { type: 'string', max: 11, min: 11 },
        lastTime: { type: 'dateTime' },
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
    const { phone, lastTime } = ctx.request.body;
    // 获取lastTime验证上次提交时间，严格校验方式应该检查数据库中上次提交的时间
    // 这里直接以前端传入时间为准
    const preTime = dayjs(lastTime);
    const nowTime = dayjs();
    if (nowTime.diff(preTime, 'second') < 90) {
      ctx.body = {
        error: true,
        message: '获取验证码太频繁！请稍后再试！',
      };
      ctx.status = 200;
      return;
    }
    let user = await ctx.model.User.findOne({ phone }).lean();
    if (!user) {
      ctx.body = {
        error: true,
        message: '该用户不存在',
      };
    }
    const code = getRandomCode();
    try {
      const res = await ctx.model.Validate.create({
        user: user._id,
        phone: user.phone,
        type: 'Forget',
        code,
        gmt_create: Date.now(),
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
      await ctx.service.sms.forgetSms(phone, code);
    } catch (error) {
      ctx.logger.error(error);
    }
    ctx.body = {
      error: false,
    }
  }

  async validateCode() {
    const { ctx } = this;
    try {
      ctx.validate({
        phone: { type: 'string', max: 11, min: 11 },
        code: { type: 'string', max: 4, min: 4 },
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
    const { phone, code } = ctx.request.body;
    const time = dayjs().subtract(2, 'minute').toDate();
    const res = await ctx.model.Validate.findOne({
      phone, code, gmt_create: { $gte: time },
    }).lean();
    ctx.body = {
      error: !Boolean(res),
    };
  }

  async noAuthChangePwd() {
    const { ctx } = this;
    try {
      ctx.validate({
        phone: { type: 'string', max: 11, min: 11 },
        code: { type: 'string', max: 4, min: 4 },
        pwd: { type: 'string' },
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
    const { phone, code, pwd } = ctx.request.body;
    const res = await ctx.model.Validate.findOne({ phone, code }).lean();
    if (!res) {
      ctx.body = {
        error: true,
        message: '验证不通过',
      };
      ctx.status = 200;
      return;
    }
    try {
      await ctx.model.User.findOneAndUpdate({ _id: res.user }, { password: pwd });
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
    };
  }

  async getUserList() {
    const { ctx } = this;
    const { role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        message: '401'
      };
      return null;
    }
    const res = await ctx.model.User
      .find({ role: 'normal' }, '-password')
      .populate({ path: 'leader', select: '-password', populate: { path: 'leader', select: '-password' } })
      .sort({ gmt_create: -1 })
      .lean();
    ctx.body = {
      error: false,
      data: res,
    };
  }

  async getGrouper() {
    const { ctx } = this;
    const { id } = ctx.params;
    if (!id) {
      ctx.body = {
        error: true,
        user: {},
        planList: [],
        pointList: [],
        refundList: [],
      };
      return;
    }
    const { id: user_id } = ctx.session;
    const user = await ctx.model.User.findOne({ _id: id, leader: user_id }, '-password');
    if (!user) {
      ctx.body = {
        error: true,
        user: {},
        planList: [],
        pointList: [],
        refundList: [],
      };
      return;
    }
    const res = await Promise.all([
      ctx.model.Plan.find({ user: id }),
      ctx.model.Point.find({ user: id }),
      ctx.model.Refund.find({ user: id })
    ]);
    const [ planList, pointList, refundList ] = res;
    ctx.body = {
      error: false,
      user,
      planList,
      pointList,
      refundList,
    };
  }

  async getUserDetail() {
    const { ctx } = this;
    const { id } = ctx.params;
    if (!id) {
      ctx.body = {
        error: true,
        user: {},
        planList: [],
        pointList: [],
        refundList: [],
      };
      return;
    }
    const { id: user_id, role } = ctx.session;
    if (!['super', 'admin'].includes(role)) {
      ctx.body = {
        error: true,
        user: {},
        planList: [],
        pointList: [],
        refundList: [],
        message: '401'
      };
      return null;
    }
    const user = await ctx.model.User.findOne({ _id: id }, '-password');
    if (!user) {
      ctx.body = {
        error: true,
        user: {},
        planList: [],
        pointList: [],
        refundList: [],
      };
      return;
    }
    const res = await Promise.all([
      ctx.model.Plan.find({ user: id }),
      ctx.model.Point.find({ user: id }),
      ctx.model.Refund.find({ user: id })
    ]);
    const [ planList, pointList, refundList ] = res;
    ctx.body = {
      error: false,
      user,
      planList,
      pointList,
      refundList,
    };
  }

  async getGroupRes() {
    const { ctx } = this;
    const { id } = ctx.session;
    const graouperOne = await ctx.model.User.find({ leader: id, _id: { $ne: id } }, '_id').lean();
    const oneIds = graouperOne.map(x => x._id);
    const grouperTwo = await ctx.model.User.find({ leader: { $in: oneIds } }, '_id').lean();
    const twoIds = grouperTwo.map(x => x._id);
    const ids = oneIds.concat(twoIds).filter(x => String(x) != id);
    ids.push(id);
    const res2 = await ctx.model.Plan.find({
      status: 'finish',
      user: { $in: ids },
    }).populate('user', 'username level').lean();

    ctx.body = {
      error: false,
      data: res2,
    }
  }

  async getGrouperList() {
    const { ctx } = this;
    const { id } = ctx.session;
    const graouper = await ctx.model.User
      .find({ leader: id, _id: { $ne: id } }, '-password')
      .populate('leader', '-password')
      .sort({ gmt_create: -1 })
      .lean();
    ctx.body = {
      error: false,
      data: graouper,
    }
  }

  async getHomeData() {
    const { ctx } = this;
    const { id } = ctx.session;
    const res1 = await ctx.model.Plan.find({
      status: 'finish',
      user: id,
    }, 'content').lean();
    const userData = res1.reduce((total, current) => total + Number(current.content), 0) || 0;

    const graouperOne = await ctx.model.User.find({ leader: id, _id: { $ne: id } }, '_id').lean();
    const oneIds = graouperOne.map(x => x._id);
    const grouperTwo = await ctx.model.User.find({ leader: { $in: oneIds } }, '_id').lean();
    const twoIds = grouperTwo.map(x => x._id);
    const ids = oneIds.concat(twoIds).filter(x => String(x) != id);
    const res2 = await ctx.model.Plan.find({
      status: 'finish',
      user: { $in: ids },
    }, 'content').lean();
    const groupData = res2.reduce((total, current) => total + Number(current.content), 0) || 0;

    let data = {
      userData,
      groupData: groupData + userData,
      grouperData: oneIds.length,
    };

    ctx.body = {
      error: false,
      data,
    }
  }

  async logout() {
    const { ctx } = this;
    ctx.session = null;
    ctx.body = {
      error: false,
    }
  }

  async changeAvator() {
    const { ctx } = this;
    try {
      ctx.validate({
        imgUrl: { type: 'url' },
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
    const { imgUrl } = ctx.request.body;
    const { id } = ctx.session;
    let res;
    try {
      res = await ctx.model.User
        .findOneAndUpdate({ _id: id }, { avator: imgUrl }, { fields: '-password -addressRegion -evidence -addressDetail -remain' })
        .populate('leader', '-password -addressRegion -evidence -addressDetail -remain')
        .lean();
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
      res.id = res._id;
      delete res._id;
      ctx.session = res;
      ctx.body = {
        error: false,
        message: '修改头像成功',
      };
    } else {
      ctx.body = {
        error: true,
        message: '修改头像出错！请重试！',
      };
    }
  }

  async changePwd() {
    const { ctx } = this;
    try {
      ctx.validate({
        pre: { type: 'string' },
        pwd: { type: 'string' },
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
    const { pre, pwd } = ctx.request.body;
    const { id } = ctx.session;
    if (pre === pwd) {
      ctx.body = {
        error: true,
        message: '新密码不能和旧密码一样',
      };
      ctx.status = 200;
      return;
    }
    let res;
    try {
      res = await ctx.model.User.findOneAndUpdate({ _id: id, password: pre }, { password: pwd });
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
        message: '修改密码成功',
      };
    } else {
      ctx.body = {
        error: true,
        message: '修改密码出错！请检查后重试！',
      };
    }
  }

  async register() {
    const { ctx } = this;
    try {
      ctx.validate({
        username: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        level: { type: 'string' },
        phone: { type: 'string' },
        IDCard: { type: 'string' },
        addressRegion: { type: 'array' },
        addressDetail: { type: 'string' },
        leader: { type: 'string' },
        evidence: { type: 'array' },
        isStore: { type: 'bool' },
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
    ctx.session = null;
    console.log(ctx.request.body);
    const { phone, leader, level } = ctx.request.body;
    const existApply = await ctx.model.Apply.findOne({ phone });
    if (existApply) {
      ctx.body = {
        error: true,
        message: '您已申请过，请勿重复申请！',
      };
      return null;
    }
    const existUser = await ctx.model.User.findOne({ phone });
    if (existUser) {
      ctx.body = {
        error: true,
        message: '注册失败！该号码已被使用！',
      };
      return null;
    }
    // 推荐合法性检查
    // const isValidPost = await ctx.service.user.isValidPost(leader, level);
    // if (!isValidPost) {
    //   ctx.logger.error('推荐验证不通过：', leader, level);
    //   ctx.body = {
    //     error: true,
    //     message: '推荐验证不通过',
    //   };
    //   ctx.status = 200;
    //   return;
    // }
    const data = ctx.request.body;
    let res;
    try {
      res = await ctx.model.Apply.create(data);
      console.log(res);
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
        message: '用户注册成功',
      };
    } else {
      ctx.body = {
        error: true,
        message: '用户注册失败',
      };
    }
  }

  async login() {
    const { ctx } = this;
    ctx.session = null;
    const { phone, password } = ctx.request.body || {};
    if (!phone || !password) {
      ctx.body = {
        error: true,
        message: '登录错误，请重试！',
      };
      ctx.status = 200;
      return;
    }
    const res = await ctx.model.User.findOne({ $or: [{ phone }, { user_id: phone }], password });
    let user = null;
    if (res) user = res.toObject();
    console.log(user);
    ctx.rotateCsrfSecret();
    if (!user || !user.role) {
      ctx.session = null;
      ctx.body = {
        error: true,
        message: '登录错误！请重试！',
      };
    } else {
      // session的属性不能以_开头，所以_id转换成id
      user.id = user._id;
      delete user._id;
      ctx.session = user;
      ctx.body = {
        error: false,
        message: '登录成功！',
      };
    }
  }
}

module.exports = UserController;