var mongoose = require('./db');
var bcrypt   = require('bcrypt-nodejs');
var activitySchema = require('./activitySchema');

var hosterSchema = new mongoose.Schema({
	id: String,
	name: String,
});

/* // methods ======================
// // generating a hash
// hosterSchema.methods.generateHash = function(password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// // checking if password is valid
// hosterSchema.methods.validPassword = function(password) {
//     return bcrypt.compareSync(password, this.local.password);
// }; */

module.exports = hosterSchema;