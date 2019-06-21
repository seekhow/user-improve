module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const LevelSchema = new Schema({
    levelName: { type: String, required: true  }, // 等级名字
    key: { type: String, enum: [ 'retail', 'vip', 'agent', 'toper', 'union' ], required: true }, // 等级key
    firstPrice: { type: Number, required: false }, // 第一次订货价格
    firstMin: { type: Number, required: false }, // 第一次订货最小量
    unitPrice: { type: Number, required: true }, // 单价
    min: { type: Number, required: true }, // 最小量
  }, {
    collection: 'level'
  });
 
  return mongoose.model('Level', LevelSchema);
}