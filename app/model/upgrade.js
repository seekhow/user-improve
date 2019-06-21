module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  // 升级记录表
  const UpgradeSchema = new Schema({
    source_level: { type: String, enum: [ 'retail', 'vip', 'agent', 'toper' ] }, // 原等级
    target_level: { type: String, enum: [ 'retail', 'vip', 'agent', 'toper', 'union' ] }, // 升级后的等级
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gmt_modify: { type: Date },
    status: { type: String, enum: [ 'init', 'paid', 'finish', 'reject' ], default: 'init' },
    evidence: { type: Array },
    note: { type: String }, // 备注
  }, {
    collection: 'upgrade'
  });
 
  return mongoose.model('Upgrade', UpgradeSchema);
}