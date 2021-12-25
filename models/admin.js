const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
	adminpass: '',
});

module.exports = mongoose.model('Admin', AdminSchema);
