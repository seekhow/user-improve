module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const PlanSchema = new Schema({
    currentPrice: { type: Number }, // 提交计划时的单价
    currentTotal: { type: Number }, // 提交计划时的总价
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    gmt_modify: { type: Date, required: false }, // 修改时间
    content: { type: Number, default: 0 }, // 数量
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: [ 'init', 'paid', 'finish', 'reject' ] },
    evidence: { type: Array },
    note: { type: String },
  }, {
    collection: 'plan'
  });
 
  return mongoose.model('Plan', PlanSchema);
}