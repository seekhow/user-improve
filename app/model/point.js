module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  // 积分记录表
  const PointSchema = new Schema({
    points: { type: Number }, // 积分数量
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['service', 'topService'] },
    // 积分类型，分别是服务人推荐
    note: { type: String }, // 备注
  }, {
    collection: 'point'
  });
 
  return mongoose.model('Point', PointSchema);
}