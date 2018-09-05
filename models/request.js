let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let RequestSchema = new Schema({
  destination: String,
  desiredTime: Date,
  // requester: {type: Schema.Types.ObjectId, ref: 'users'},
  timeBuffer: Number,
  userID: Number,
});

module.exports = mongoose.model('Request', RequestSchema);
