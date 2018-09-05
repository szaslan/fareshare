const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  firstName: { type: String, default: 'Morty' },
  lastName: { type: String, default: 'Schapiro' },
  profileUrl: { type: String, default: 'https://randomuser.me/api/portraits/lego/7.jpg' },
  email: String,
  verified: {
    type: Boolean,
    default: false,
  },
  // password: {
  // 	type: String,
  // 	required: true,
  // },
  // passwordConf: {
  // 	type: String,
  // 	required: true,
  // }
});

module.exports = mongoose.model('User', UserSchema);
