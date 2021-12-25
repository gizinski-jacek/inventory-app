const Item = require('../models/item');

exports.catalog_index = (req, res, next) => {
	Item.find().exec((err, item_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_list', {
			title: 'F1 Shop',
			catalog: '/catalog/',
			item_list: item_list,
		});
	});
};
