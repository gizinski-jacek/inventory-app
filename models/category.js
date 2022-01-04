const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
	name: { type: String, minlength: 3, maxlength: 15, required: true },
	description: { type: String, minlength: 1, maxlength: 200 },
	permanent: { type: Boolean, default: 0 },
});

// Virtual for category's URL
CategorySchema.virtual('url').get(function () {
	return '/catalog/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);
