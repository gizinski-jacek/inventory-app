const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.catalog_index = (req, res, next) => {
	Item.find().exec((err, item_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_list', {
			title: 'F1 Shop',
			path: req.baseUrl + '/',
			item_list: item_list,
		});
	});
};
