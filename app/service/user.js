'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  async isValidPost(leader, level) {
    const { ctx } = this;
    if (!leader || !level) return null;
    const arr = [ 'retail', 'vip', 'agent', 'toper', 'union' ];
    if (!arr.includes(level)) return null;
    const leaderInfo = await ctx.model.User.findById(leader).lean();
    const leaderLevel = leaderInfo.level;
    if (!leaderLevel) return null;
    if (!['agent', 'toper', 'union'].includes(leaderLevel)) return null; // 只有等级2和等级3可以推荐
    if (level === 'toper' && leaderLevel === 'agent') return null; // 等级2不能推荐等级3
    return true;
  }

  async agreeCheck(id) {
    const { ctx } = this;
    // 更新Apply状态
    // 将Apply数据复制到User
    let counter = 111111;
    const [first, ...others] = await ctx.model.User
      .find({ user_id: { $gt: 0 } })
      .sort({ user_id: -1 });
    if (first) {
      counter = first.user_id + 1;
    }
    let data;
    let user;
    try {
      const res = await ctx.model.Apply.findOneAndUpdate({ _id: id, status: 'init' }, { status: 'accept' });
      if (res) {
        data = res.toObject();
      } else {
        return null;
      }
      delete data._id;
      delete data.__v;
      delete data.gmt_create;
      delete data.status;
      data.user_id = counter;
      user = await ctx.model.User.create(data);
    } catch (error) {
      ctx.logger.error(error);
      ctx.logger.error('User创建失败', res, user);
      return null;
    }
    // 先为新用户生成Plan以及更新Remain
    let planMap;
    switch (user.level) {
      case 'vip':
        planMap = {
          currentPrice: 198,
          content: 1
        };
        break;
      case 'agent': 
        planMap = {
          currentPrice: 110,
          content: 12
        };
        break;
      case 'toper':
        planMap = {
          currentPrice: 75,
          content: 100
        };
        break;
      default:
        break;
    }
    if (!planMap) return null;
    try {
      const res1 = await ctx.model.Plan.create({
        currentPrice: planMap.currentPrice,
        currentTotal: planMap.currentPrice * planMap.content,
        content: planMap.content,
        product: '5ce01b784f4fec230c35b556',
        user: user._id,
        status: 'finish',
        evidence: [],
        note: '新用户审核通过直接为其自动补货添加库存量',
      });
      await ctx.model.User.findOneAndUpdate({ _id: user._id }, {
        $inc: { remain: planMap.content },
      });
    } catch (error) {
      ctx.logger.error(error);
      ctx.logger.error('新用户审核通过直接为其自动补货添加库存量失败', planMap, user);
      return null;
    }
    // 如果user的isStore属性为真，增加points
    if (user.isStore) {
      try {
        const ret = await ctx.model.User.findOneAndUpdate({ _id: user._id }, {
          $inc: { points: 500 },
        });
        if (ret) {
          const rett = await ctx.model.Point.create({
            points: 500,
            user: user._id,
            type: 'storeAd',
            source: user._id,
          });
        }
      } catch (error) {
        ctx.logger.error(error);
        ctx.logger.error('为新用户添加[店铺]积分失败', user);
      }
    }
    // 为该用户的leader更改数据
    let userLeader;
    if (user.leader && String(user.leader) !== String(user._id)) {
      try {
        const points = planMap.content * 5;
        userLeader= await ctx.model.User.findOneAndUpdate({ _id: user.leader, level: user.level }, {
          $inc: { points },
        }).lean();
        if (userLeader) {
          const res3 = await ctx.model.Point.create({
            points,
            user: user.leader,
            type: 'service',
            source: user._id,
          });
        }
      } catch (error) {
        ctx.logger.error(error);
        ctx.logger.error('为新用户的leader添加积分失败', user.leader, userLeader);
      }
    }
    if (userLeader && userLeader.leader && String(userLeader.leader) !== String(userLeader._id) && String(userLeader.leader) !== String(user._id)) {
      try {
        const points = planMap.content * 2;
        const res4 = await ctx.model.User.findOneAndUpdate({ _id: userLeader.leader }, {
          $inc: { points },
        }).lean();
        const res5 = await ctx.model.Point.create({
          points,
          user: userLeader.leader,
          type: 'topService',
          source: user._id,
        });
      } catch (error) {
        ctx.logger.error(error);
        ctx.logger.error('为新用户的二级leader添加积分失败', userLeader);
      }
    }
    try {
      await ctx.service.sms.agreeCheckSms(user.phone, user.username);
    } catch (error) {
      ctx.logger.error(error);
    }
    return true;
  }
}

module.exports = UserService;