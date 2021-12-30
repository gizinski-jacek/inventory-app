const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: { type: String, minlength: 3, maxlength: 30, required: true },
	description: { type: String, minlength: 1, maxlength: 200 },
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	price: { type: Number, min: 0, required: true },
	stock: { type: Number, min: 0, required: true },
	imgName: { type: String },
	permanent: { type: Boolean, default: 0 },
});

ItemSchema.virtual('check_price').get(function () {
	let price = this.price + ' $';
	if (!this.price) {
		price = 'FREE';
	}
	return price;
});

ItemSchema.virtual('check_stock').get(function () {
	let stock = this.stock + ' left';
	if (!this.stock) {
		stock = 'N/A';
	}
	return stock;
});

ItemSchema.virtual('url').get(function () {
	return '/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);
