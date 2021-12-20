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
	async.parallel(
		{
			category: (cb) => {
				Category.findById(req.params.id).exec(cb);
			},
			item_list: (cb) => {
				Item.find({ category: req.params.id }).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('item_list', {
				title: results.category.name,
				item_list: results.item_list,
			});
		}
	);
};
