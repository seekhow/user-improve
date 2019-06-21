module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const UserSchema = new Schema({
    username: { type: String  }, // 姓名
    password: { type: String  }, // 密码
    role: { type: String, enum: ['normal', 'admin', 'super'], default: 'normal' }, // 系统权限
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    level: { type: String, enum: ['retail', 'vip', 'agent', 'toper', 'union'] }, // 等级1，等级2，等级3
    phone: { type: String }, // 电话
    IDCard: { type: String }, // 身份证号
    addressRegion: { type: Array }, // 所在区域
    addressDetail: { type: String }, // 详细地址
    leader: { type: Schema.Types.ObjectId, ref: 'User' }, // 邀请人的用户id
    evidence: { type: Array }, // 支付凭证
    status: { type: String, enum: ['init', 'accept', 'reject'], default: 'init' }, // 申请状态，初始化/通过/拒绝
    isStore: { type: Boolean, default: false }, // 是否为店铺
  }, {
    collection: 'apply'
  });
 
  return mongoose.model('Apply', UserSchema);
}