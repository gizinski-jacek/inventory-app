const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: { type: String, minlength: 1, maxlength: 30, required: true },
	description: { type: String, minlength: 1, maxlength: 100 },
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		// required: true, // Have to comment out for now, getting ValidationError: category: Path `category` is required. Looking for solution.
	},
	price: { type: Number, min: 0, required: true },
	stock: { type: Number, min: 0, required: true },
	permanent: { type: Boolean, default: 0 },
});

ItemSchema.virtual('availability').get(function () {
	let availability = `In stock:` + this.stock;
	if (!this.stock) {
		availability = `Out of stock`;
	}
	return availability;
});

ItemSchema.virtual('url').get(function () {
	return '/item/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);
