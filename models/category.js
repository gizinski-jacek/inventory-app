const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
	name: { type: String, minlength: 1, maxlength: 20, required: true },
	description: { type: String, minlength: 1, maxlength: 100 },
});

CategorySchema.virtual('url').get(function () {
	return '/catalog/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);
