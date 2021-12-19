const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.item_details = (req, res, next) => {
	Item.findById(req.params.id).exec((err, item) => {
		if (err) {
			return next(err);
		}
		res.render('item_details', {
			title: 'F1 Shop',
			item: item,
		});
	});
};
