module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  // 积分记录表
  const RefundSchema = new Schema({
    points: { type: Number }, // 积分数量
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gmt_modify: { type: Date },
    status: { type: String, enum: [ 'init', 'finish', 'reject' ], default: 'init' },
    note: { type: String }, // 备注
  }, {
    collection: 'refund'
  });
 
  return mongoose.model('Refund', RefundSchema);
}