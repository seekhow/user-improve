module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const UserSchema = new Schema({
    user_id: { type: Number, required: true },
    username: { type: String  }, // 姓名
    password: { type: String  }, // 密码
    role: { type: String, enum: ['normal', 'admin', 'super'], default: 'normal' }, // 系统权限
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    level: { type: String, enum: [ 'retail', 'vip', 'agent', 'toper' ] }, // 零售，等级1，等级2，等级3
    isUnion: { type: Boolean, default: false }, // 是否是特殊用户
    phone: { type: String }, // 电话
    IDCard: { type: String }, // 身份证号
    addressRegion: { type: Array }, // 所在区域
    addressDetail: { type: String }, // 详细地址
    leader: { type: Schema.Types.ObjectId, ref: 'User' }, // 邀请人的用户id
    evidence: { type: Array }, // 支付凭证
    avator: { type: String }, // 头像地址
    isStore: { type: Boolean, default: false }, // 是否为店铺
    remain: { type: Number, default: 0 }, // 个人库存
    points: { type: Number, default: 0 }, // 积分记录
  }, {
    collection: 'users'
  });

  // UserSchema.pre('save', async function(next) {
  //   var doc = this;
  //   counter.find({}, {}, function(error, counter) {
  //     if (error) return next(error);
  //     doc.testvalue = counter.seq;
  //     next();
  //   });
  // });
 
  return mongoose.model('User', UserSchema);
}