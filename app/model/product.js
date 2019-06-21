module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const ProductSchema = new Schema({
    name: { type: String  }, // 产品名
    originPrice: { type: Number  }, // 统一零售价
    price: { type: Number }, // 等级1价
    gmt_create: { type: Date, default: Date.now }, // 创建时间
    cover: { type: String }, // 图片
    used: { type: Boolean, default: false }, // 是否上架
    remain: { type: Number, default: 0 }, // 库存数
    desc: { type: String }, // 描述信息
  }, {
    collection: 'product'
  });
 
  return mongoose.model('Product', ProductSchema);
}