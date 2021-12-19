const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.category_list = (req, res, next) => {
	Category.find().exec((err, category_list) => {
		if (err) {
			return next(err);
		}
		res.render('index', {
			title: 'F1 Shop',
			category_list: category_list,
		});
	});
};

exports.category_index = (req, res, next) => {
	Item.find({ category: req.params.id }).exec((err, item_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_list', {
			title: 'F1 Shop',
			item_list: item_list,
		});
	});
};
