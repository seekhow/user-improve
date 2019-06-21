module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const ComboSchema = new Schema({
    name: { type: String  }, // 产品名
    price: { type: Number }, // 等级1价
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    cover: { type: String }, // 图片
    content: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      number: { type: Number },
    }]
  }, {
    collection: 'combo'
  });
 
  return mongoose.model('Combo', ComboSchema);
}