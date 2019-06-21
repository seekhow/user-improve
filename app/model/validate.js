module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
 
  const ValidateSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true },
    type: { type: String },
    code: { type: Number },
    gmt_create: { type: Date, default: Date.now }, // 创建时间
  }, {
    collection: 'validate'
  });
 
  return mongoose.model('Validate', ValidateSchema);
}